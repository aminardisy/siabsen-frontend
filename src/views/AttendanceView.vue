<template>
  <div class="p-6 bg-slate-50 min-h-screen">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#1A2342]">Absensi Harian Siswa</h1>

        <div class="mt-2 flex items-center gap-2">
          <span class="text-gray-500 font-medium">Kelas:</span>

          <span v-if="authStore.user?.role === 'SEKRETARIS'" class="font-bold text-[#26A69A] bg-teal-50 px-3 py-1 rounded-lg">
            {{ attendanceStore.allowedClasses[0]?.namaKelas || 'Memuat...' }}
          </span>

          <select
            v-else
            v-model="attendanceStore.selectedKelasId"
            @change="loadData"
            class="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-[#1A2342] shadow-sm outline-none focus:ring-2 focus:ring-[#26A69A]"
          >
            <option :value="null" disabled>-- Pilih Kelas --</option>
            <option v-for="kelas in attendanceStore.allowedClasses" :key="kelas.id" :value="kelas.id">
              {{ kelas.namaKelas }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <input
          type="date"
          v-model="selectedDate"
          @change="loadData"
          class="outline-none text-gray-700 bg-transparent cursor-pointer font-semibold"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div v-for="(val, key) in attendanceStore.attendanceData.summary" :key="key"
           class="bg-white p-4 rounded-2xl shadow-sm border-b-4 border-[#26A69A] transition-transform hover:scale-105">
        <p class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{{ key }}</p>
        <p class="text-2xl font-black text-[#1A2342]">{{ val }}</p>
      </div>
    </div>

    <div v-if="attendanceStore.selectedKelasId" class="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <table class="w-full text-left">
        <thead class="bg-[#1A2342] text-white">
          <tr>
            <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">No</th>
            <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Nama Siswa</th>
            <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Status Kehadiran</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(siswa, index) in attendanceStore.attendanceData.students" :key="siswa.id" class="hover:bg-slate-50/80 transition-colors">
            <td class="px-6 py-4 text-sm text-gray-400 font-mono">{{ index + 1 }}</td>
            <td class="px-6 py-4 font-semibold text-slate-700">{{ siswa.nama }}</td>
            <td class="px-6 py-4">
              <div class="flex justify-center gap-2">
                <button
                  v-for="status in ['HADIR', 'SAKIT', 'IZIN', 'ALPHA']"
                  :key="status"
                  @click="updateLocalStatus(siswa.id, status)"
                  :disabled="isStatusDisabled"
                  :class="[
                    'px-4 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300',
                    siswa.status === status
                      ? getStatusColor(status)
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  ]"
                >
                  {{ status }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="bg-white p-20 rounded-2xl border-2 border-dashed border-slate-200 text-center">
      <p class="text-slate-400 font-medium">Silakan pilih kelas terlebih dahulu untuk melihat data absensi.</p>
    </div>

    <div class="mt-8 flex justify-end items-center gap-4">
      <p v-if="attendanceStore.isLoading" class="text-sm text-gray-400 animate-pulse">Memproses data...</p>

      <button
        v-if="authStore.user?.role === 'SEKRETARIS' && !attendanceStore.isLocked"
        @click="handleMainAction"
        :class="[
          'px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95',
          attendanceStore.isSubmitted ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#1A2342] hover:bg-slate-800'
        ]"
      >
        {{ attendanceStore.isSubmitted ? 'Update Laporan' : 'Kirim Laporan' }}
      </button>

      <button
        v-if="authStore.user?.role === 'GURU' && attendanceStore.isSubmitted && !attendanceStore.isLocked"
        @click="handleApprove"
        class="px-8 py-3 bg-[#26A69A] rounded-xl font-bold text-white hover:bg-[#1f8a7f] shadow-lg active:scale-95 transition-all"
      >
        Setujui Laporan (Approve)
      </button>

      <div v-if="attendanceStore.isLocked" class="flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl font-bold border border-green-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
        Laporan Terkunci & Disetujui
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useAuthStore } from '@/stores/auth'

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

const selectedDate = ref(new Date().toISOString().substr(0, 10))

// Logika untuk mendisable tombol status absensi
const isStatusDisabled = computed(() => {
  // 1. Jika sudah LOCKED (Approved), semua role tidak bisa ubah
  if (attendanceStore.isLocked) return true

  // 2. Jika role SEKRETARIS dan sudah SUBMITTED, dia tidak bisa ubah lagi
  if (authStore.user?.role === 'SEKRETARIS' && attendanceStore.isSubmitted) return true

  // 3. Admin tidak bisa ubah sama sekali
  if (authStore.user?.role === 'ADMIN') return true

  return false
})

const loadData = async () => {
  if (attendanceStore.selectedKelasId) {
    await attendanceStore.fetchAttendance(attendanceStore.selectedKelasId, selectedDate.value)
  }
}

const updateLocalStatus = (siswaId: number, status: string) => {
  const siswa = attendanceStore.attendanceData.students.find(s => s.id === siswaId)
  if (siswa) {
    siswa.status = status
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'HADIR': return 'bg-[#26A69A] text-white shadow-md shadow-teal-100 scale-105'
    case 'SAKIT': return 'bg-yellow-500 text-white shadow-md shadow-yellow-100 scale-105'
    case 'IZIN': return 'bg-blue-500 text-white shadow-md shadow-blue-100 scale-105'
    case 'ALPHA': return 'bg-red-500 text-white shadow-md shadow-red-100 scale-105'
    default: return 'bg-slate-100 text-slate-400'
  }
}

const handleMainAction = async () => {
  if (!attendanceStore.selectedKelasId) return

  const payload = {
    kelasId: attendanceStore.selectedKelasId,
    tanggal: selectedDate.value,
    attendanceList: attendanceStore.attendanceData.students.map(s => ({
      studentId: s.id,
      status: s.status
    }))
  }

  try {
    await attendanceStore.submitAttendance(payload)
    alert('Laporan berhasil dikirim!')
  } catch (error: any) {
    alert('Gagal mengirim: ' + error.message)
  }
}

const handleApprove = async () => {
  if (confirm('Setujui laporan hari ini? Data tidak akan bisa diubah lagi.')) {
    try {
      await attendanceStore.approveAttendance(attendanceStore.selectedKelasId!, selectedDate.value)
      alert('Laporan disetujui Wali Kelas!')
    } catch (error: any) {
      alert('Gagal approve: ' + error.message)
    }
  }
}

onMounted(async () => {
  // Ambil daftar kelas yang diizinkan (berdasarkan role di backend)
  await attendanceStore.fetchAllowedClasses()

  // Jika auto-select sudah bekerja di store (untuk sekretaris), langsung load data
  if (attendanceStore.selectedKelasId) {
    await loadData()
  }
})
</script>
