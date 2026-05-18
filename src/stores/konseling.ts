import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import {
  getSiswaWajibKonseling,
  createKonseling,
  getRiwayatKonseling,
  updateKonseling,
  deleteKonseling,
} from '@/services/konselingService'
import type {
  SiswaWajibKonseling,
  RiwayatKonseling,
  CreateKonselingPayload,
  UpdateKonselingPayload,
} from '@/models/konseling'
import type { SiswaResponse } from '@/models/siswa'
import { siswaService } from '@/services/siswaService'

export const useKonselingStore = defineStore('konseling', () => {
  // ── State Wajib Konseling ──
  const selectedMonth = ref(new Date().toISOString().slice(0, 7))
  const wajibList = ref<SiswaWajibKonseling[]>([])
  const isLoadingWajib = ref(false)

  // ── State Riwayat Konseling ──
  const riwayatList = ref<RiwayatKonseling[]>([])
  const isLoadingRiwayat = ref(false)
  const filterStudentId = ref<number | null>(null)
  const filterStartDate = ref('')
  const filterEndDate = ref('')

  // ── State Modal Create ──
  const showCreateModal = ref(false)
  const createTarget = ref<SiswaWajibKonseling | null>(null)
  const createForm = ref({ date: '', topic: '', violationType: '', initialNotes: '' })
  const createError = ref('')
  const isSubmitting = ref(false)

  // ── State Modal Edit ──
  const showEditModal = ref(false)
  const editTarget = ref<RiwayatKonseling | null>(null)
  const editForm = ref({ date: '', topic: '', violationType: '', initialNotes: '' })
  const editError = ref('')

  // ── State Custom Local Toast ──
  const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  // ── Getters (Computed) ──
  const hasWajibData = computed(() => wajibList.value.length > 0)
  const hasRiwayatData = computed(() => riwayatList.value.length > 0)

  // Menghindari circular dependency dengan memanggil useAuthStore di dalam scope getter
  const canManageKonseling = computed(() => {
    const authStore = useAuthStore()
    return ['KESISWAAN', 'ADMIN'].includes(authStore.user?.role || '')
  })

  const allSiswa = ref<SiswaResponse[]>([])
  const searchQuery = ref('')
  const historySearchQuery = ref('')
  const selectedHistorySiswaData = ref<SiswaResponse | null>(null)

  // Computed untuk filter search siswa aktif (digunakan di modal create)
  const filteredSiswa = computed(() => {
    if (!searchQuery.value) return []
    const q = searchQuery.value.toLowerCase()
    return allSiswa.value
      .filter(s =>
        (s.nama?.toLowerCase().includes(q) || s.nisn?.includes(q)) &&
        s.status?.toLowerCase() === 'aktif'
      )
      .sort((a, b) => (a.nama || '').localeCompare(b.nama || ''))
  })

  // Computed untuk filter search siswa di tab riwayat (PK-04)
  const filteredSiswaHistory = computed(() => {
    const q = (historySearchQuery.value || '').toLowerCase()
    let result = allSiswa.value.filter(s => s.status?.toLowerCase() === 'aktif')

    if (q) {
      result = result.filter(s =>
        (s.nama?.toLowerCase().includes(q) || (s as any).namaLengkap?.toLowerCase().includes(q) || s.nisn?.includes(q))
      )
    }

    return result
      .sort((a, b) => (a.nama || '').localeCompare(b.nama || ''))
      .slice(0, 5) // Tampilkan 5 data pertama agar identik dengan catat-keterlambatan
  })

  // Computed untuk data tabel riwayat yang sudah difilter secara lokal (Live Search)
  const filteredRiwayatList = computed(() => {
    if (!historySearchQuery.value) return riwayatList.value
    const q = historySearchQuery.value.toLowerCase()
    return riwayatList.value.filter(item =>
      item.siswaNama?.toLowerCase().includes(q) ||
      item.siswaNisn?.toLowerCase().includes(q)
    )
  })

  // ── Actions ──

  // Custom Toast Handler
  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastTimer) clearTimeout(toastTimer)
    toast.value = { show: true, message, type }
    toastTimer = setTimeout(() => {
      toast.value.show = false
    }, 3500)
  }

  const fetchAllSiswa = async () => {
    if (allSiswa.value.length > 0) return // Hindari fetch berulang jika sudah ada
    try {
      const res = await siswaService.getAll()
      allSiswa.value = Array.isArray(res) ? res : (res as any).data || []
    } catch {
      showToast('Gagal memuat master data siswa', 'error')
    }
  }

  const pilihSiswaForm = (siswa: SiswaResponse) => {
    createTarget.value = {
      studentId: siswa.id,
      name: siswa.nama,
      nisn: siswa.nisn,
      kelas: siswa.namaKelas,
      totalLate: 0 // Default 0 karena bukan dari jalur peringatan absen
    }
    searchQuery.value = '' // bersihkan search bar setelah dipilih
  }

  const selectHistorySiswa = (siswa: SiswaResponse) => {
    filterStudentId.value = siswa.id
    selectedHistorySiswaData.value = siswa
    historySearchQuery.value = ''
    fetchRiwayatKonseling(siswa.id, filterStartDate.value, filterEndDate.value)
  }

  const clearHistoryFilter = () => {
    filterStudentId.value = null
    selectedHistorySiswaData.value = null
    historySearchQuery.value = ''
    fetchRiwayatKonseling(undefined, filterStartDate.value, filterEndDate.value)
  }

  const openCreateModal = (item?: SiswaWajibKonseling) => {
    fetchAllSiswa()
    searchQuery.value = ''
  
    if (item) {
      createTarget.value = item
  
      const isAlpha = item.totalAlpha >= 3 && item.totalAlpha >= item.totalLate
      const isBoth = item.totalLate >= 3 && item.totalAlpha >= 3
  
      createForm.value = {
        date: new Date().toISOString().slice(0, 10),
        topic: isBoth
          ? 'Keterlambatan & Alpha berulang'
          : isAlpha
            ? 'Alpha berulang'
            : 'Keterlambatan berulang',
        violationType: isBoth ? 'TERLAMBAT, ALPHA' : isAlpha ? 'ALPHA' : 'TERLAMBAT',
        initialNotes: isBoth
          ? `Siswa terlambat ${item.totalLate}x dan alpha ${item.totalAlpha}x bulan ini.`
          : isAlpha
            ? `Siswa alpha ${item.totalAlpha}x bulan ini.`
            : `Siswa terlambat ${item.totalLate}x bulan ini.`,
      }
    } else {
      createTarget.value = null
      createForm.value = {
        date: new Date().toISOString().slice(0, 10),
        topic: '',
        violationType: '',
        initialNotes: '',
      }
    }
    createError.value = ''
    showCreateModal.value = true
  }

  // Fetch Daftar Siswa Wajib Konseling (PK-01)
  const fetchWajibKonseling = async (month: string, classId?: number) => {
    isLoadingWajib.value = true
    try {
      wajibList.value = await getSiswaWajibKonseling(month, classId)
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Gagal memuat siswa wajib konseling', 'error')
    } finally {
      isLoadingWajib.value = false
    }
  }

  // Fetch Riwayat Konseling Siswa (PK-04)
  const fetchRiwayatKonseling = async (studentId?: number, startDate?: string, endDate?: string) => {
    isLoadingRiwayat.value = true
    try {
      riwayatList.value = await getRiwayatKonseling(studentId, startDate, endDate)
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Gagal memuat riwayat konseling', 'error')
    } finally {
      isLoadingRiwayat.value = false
    }
  }

  const closeCreateModal = () => {
    showCreateModal.value = false
    createTarget.value = null
    createForm.value = { date: '', topic: '', violationType: '', initialNotes: '' }
    createError.value = ''
  }

  const submitCreate = async () => {
    if (!createForm.value.date || !createForm.value.topic.trim()) {
      createError.value = 'Tanggal dan topik wajib diisi.'
      return
    }

    isSubmitting.value = true
    try {
      const payload: CreateKonselingPayload = {
        studentId: createTarget.value!.studentId,
        date: createForm.value.date,
        topic: createForm.value.topic,
        violationType: createForm.value.violationType || undefined,
        initialNotes: createForm.value.initialNotes || undefined,
      }
      await createKonseling(payload)
      showToast('Jadwal konseling berhasil dibuat', 'success')
      closeCreateModal()
      // Refresh list riwayat & wajib setelah data berhasil masuk
      await fetchWajibKonseling(selectedMonth.value)
      await fetchRiwayatKonseling(filterStudentId.value ?? undefined, filterStartDate.value, filterEndDate.value)
    } catch (error: any) {
      createError.value = error.response?.data?.message || 'Gagal membuat jadwal konseling'
      showToast(createError.value, 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  // Handle Modal Edit (PK-05)
  const openEditModal = (item: RiwayatKonseling) => {
    editTarget.value = item
    editForm.value = {
      date: item.date,
      topic: item.topic,
      violationType: item.jenisPelanggaran || '',
      initialNotes: item.catatanAwal || '',
    }
    editError.value = ''
    showEditModal.value = true
  }

  const closeEditModal = () => {
    showEditModal.value = false
    editTarget.value = null
    editForm.value = { date: '', topic: '', violationType: '', initialNotes: '' }
    editError.value = ''
  }

  const submitEdit = async () => {
    if (!editForm.value.date || !editForm.value.topic.trim()) {
      editError.value = 'Tanggal dan topik wajib diisi.'
      return
    }

    try {
      const payload: UpdateKonselingPayload = {
        date: editForm.value.date,
        topic: editForm.value.topic,
        violationType: editForm.value.violationType || undefined,
        initialNotes: editForm.value.initialNotes || undefined,
      }
      await updateKonseling(editTarget.value!.id, payload)
      showToast('Jadwal konseling berhasil diperbarui', 'success')
      closeEditModal()
      await fetchRiwayatKonseling(filterStudentId.value ?? undefined, filterStartDate.value, filterEndDate.value)
    } catch (error: any) {
      editError.value = error.response?.data?.message || 'Gagal memperbarui jadwal konseling'
      showToast(editError.value, 'error')
    }
  }

  // Handle Delete (PK-06)
  const removeKonseling = async (id: number) => {
    try {
      await deleteKonseling(id)
      showToast('Jadwal konseling berhasil dihapus', 'success')
      await fetchRiwayatKonseling(filterStudentId.value ?? undefined, filterStartDate.value, filterEndDate.value)
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Gagal menghapus jadwal konseling', 'error')
    }
  }

  // Reset State Global Store
  const resetStore = () => {
    selectedMonth.value = new Date().toISOString().slice(0, 7)
    wajibList.value = []
    riwayatList.value = []
    filterStudentId.value = null
    filterStartDate.value = ''
    filterEndDate.value = ''
    closeCreateModal()
    closeEditModal()
  }

  return {
    selectedMonth,
    wajibList,
    isLoadingWajib,
    riwayatList,
    isLoadingRiwayat,
    filterStudentId,
    filterStartDate,
    filterEndDate,
    showCreateModal,
    createTarget,
    createForm,
    createError,
    isSubmitting,
    allSiswa,
    searchQuery,
    filteredSiswa,
    historySearchQuery,
    filteredSiswaHistory,
    selectedHistorySiswaData,
    filteredRiwayatList,
    pilihSiswaForm,
    showEditModal,
    editTarget,
    editForm,
    editError,
    toast,
    hasWajibData,
    hasRiwayatData,
    canManageKonseling,
    fetchWajibKonseling,
    fetchRiwayatKonseling,
    openCreateModal,
    closeCreateModal,
    submitCreate,
    openEditModal,
    closeEditModal,
    submitEdit,
    removeKonseling,
    showToast,
    resetStore,
    fetchAllSiswa,
    selectHistorySiswa,
    clearHistoryFilter,
  }
})
