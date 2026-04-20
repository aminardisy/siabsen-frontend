// src/stores/attendance.ts
import { defineStore } from 'pinia'
import api from '../api/axios' // Menggunakan instance yang sudah ada interceptor JWT-nya

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    allowedClasses: [] as any[],
    selectedKelasId: null as number | null,
    attendanceData: {
      namaKelas: '',
      tanggal: '',
      students: [] as any[],
      summary: {
        hadir: 0,
        sakit: 0,
        izin: 0,
        alfa: 0
      }
    },
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    // Mengecek apakah data sudah dikunci (APPROVED) oleh Guru
    isLocked: (state) => state.attendanceData.students.some(s => s.reportStatus === 'APPROVED'),
    // Mengecek apakah laporan sudah dikirim (SUBMITTED) oleh Sekretaris
    isSubmitted: (state) => state.attendanceData.students.some(s => s.reportStatus === 'SUBMITTED')
  },

  actions: {
    // 1. Ambil daftar kelas yang diizinkan untuk User yang sedang login
    async fetchAllowedClasses() {
      try {
        // Cukup tulis path setelah /api/
        const response = await api.get('/absensi/allowed-classes')
        this.allowedClasses = response.data

        // Jika hanya ada 1 kelas (Sekretaris/Wali Kelas), otomatis pilih ID-nya
        if (this.allowedClasses.length === 1) {
          this.selectedKelasId = this.allowedClasses[0].id
        }
      } catch (err: any) {
        this.error = 'Gagal memuat daftar kelas'
        console.error(err)
      }
    },

    // 2. Ambil data detail absensi per kelas dan tanggal
    async fetchAttendance(kelasId: number, tanggal: string) {
      this.isLoading = true
      this.error = null
      try {
        const response = await api.get('/absensi', {
          params: { kelasId, tanggal }
        })
        this.attendanceData = response.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Gagal mengambil data absensi'
      } finally {
        this.isLoading = false
      }
    },

    // 3. Kirim laporan awal (Hanya untuk Sekretaris)
    async submitAttendance(payload: any) {
      this.isLoading = true
      try {
        await api.post('/absensi/submit', payload)
        // Auto-refresh data agar UI sinkron dengan status SUBMITTED
        await this.fetchAttendance(payload.kelasId, payload.tanggal)
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Gagal mengirim laporan')
      } finally {
        this.isLoading = false
      }
    },

    // 4. Menyetujui/Lock laporan (Hanya untuk Guru)
    async approveAttendance(kelasId: number, tanggal: string) {
      this.isLoading = true
      try {
        await api.patch('/absensi/approve', null, {
          params: { kelasId, tanggal }
        })
        // Auto-refresh data agar UI sinkron dengan status APPROVED
        await this.fetchAttendance(kelasId, tanggal)
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Gagal menyetujui laporan')
      } finally {
        this.isLoading = false
      }
    }
  }
})
