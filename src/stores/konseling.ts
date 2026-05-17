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

  // Computed untuk filter search siswa aktif
  const filteredSiswa = computed(() => {
    if (!searchQuery.value) return []
    const q = searchQuery.value.toLowerCase()
    return allSiswa.value.filter(s =>
      (s.nama?.toLowerCase().includes(q) || s.nisn?.includes(q)) &&
      s.status?.toLowerCase() === 'aktif'
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

  const openCreateModal = (item?: SiswaWajibKonseling) => {
    fetchAllSiswa() // tarik data siswa buat jaga-jaga kalau buat mandiri
    searchQuery.value = ''

    if (item) {
      // Jika diklik dari tabel Wajib Konseling (PK-01)
      createTarget.value = item
      createForm.value = {
        date: new Date().toISOString().slice(0, 10),
        topic: 'Keterlambatan berulang',
        violationType: 'TERLAMBAT',
        initialNotes: `Siswa telah mencapai batas ambang keterlambatan sebanyak ${item.totalLate} kali bulan ini.`,
      }
    } else {
      // Jika diklik dari tombol "Buat Jadwal Mandiri"
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
  }
})
