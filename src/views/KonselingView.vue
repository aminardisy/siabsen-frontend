<template>
    <div class="p-6 bg-slate-50 min-h-screen">
  
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#1A2342]">Konseling Siswa</h1>
          <p class="text-sm text-gray-400 mt-1">Manajemen jadwal dan riwayat konseling</p>
        </div>
        <!-- Filter Bulan untuk Wajib Konseling -->
        <div class="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
          <span class="text-gray-400 text-sm font-medium">Bulan</span>
          <input
            type="month"
            v-model="selectedMonth"
            class="outline-none text-gray-700 bg-transparent cursor-pointer font-semibold"
          />
        </div>
      </div>
  
      <!-- Tab -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="activeTab === tab.key
            ? 'bg-[#1A2342] text-white shadow-lg'
            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'"
          class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
        >
          {{ tab.label }}
        </button>
      </div>
  
      <!-- ══════════════════════════════════════════ -->
      <!-- TAB 1: Wajib Konseling (PK-01)            -->
      <!-- ══════════════════════════════════════════ -->
      <div v-if="activeTab === 'wajib'">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 class="font-bold text-[#1A2342]">Siswa Wajib Konseling</h2>
            <span class="text-xs text-gray-400">{{ wajibList.length }} siswa</span>
          </div>
  
          <div v-if="isLoadingWajib" class="p-12 text-center text-gray-400 text-sm animate-pulse">
            Memuat data...
          </div>
  
          <div v-else-if="wajibList.length === 0" class="p-12 text-center text-gray-400 text-sm">
            <div class="mb-2 text-3xl">✅</div>
            Tidak ada siswa wajib konseling pada periode ini
          </div>
  
          <table v-else class="w-full text-left">
            <thead class="bg-[#1A2342] text-white">
              <tr>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Siswa</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">NISN</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Kelas</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Total Terlambat</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in wajibList" :key="item.studentId" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-6 py-4">
                  <p class="font-semibold text-slate-700 text-sm">{{ item.name }}</p>
                </td>
                <td class="px-6 py-4 text-sm text-slate-500 font-mono">{{ item.nisn }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ item.kelas }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">
                    {{ item.totalLate }}x
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <button
                    @click="openCreateModal(item)"
                    class="px-4 py-1.5 bg-[#26A69A] text-white rounded-lg text-xs font-bold hover:bg-[#1f8a7f] transition shadow-sm"
                  >
                    Buat Jadwal
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- ══════════════════════════════════════════ -->
      <!-- TAB 2: Riwayat Konseling (PK-04)          -->
      <!-- ══════════════════════════════════════════ -->
      <div v-if="activeTab === 'riwayat'">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-bold text-[#1A2342]">Riwayat Konseling</h2>
              <span class="text-xs text-gray-400">{{ riwayatList.length }} data</span>
            </div>
  
            <!-- Filter Riwayat -->
            <div class="flex flex-wrap items-end gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div class="flex-1 min-w-[150px]">
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filter Siswa ID</label>
                <input
                  type="number"
                  v-model.number="filterStudentId"
                  placeholder="ID Siswa (kosongkan = semua)"
                  class="w-full text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#26A69A]"
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dari</label>
                <input type="date" v-model="filterStartDate" class="text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#26A69A]" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sampai</label>
                <input type="date" v-model="filterEndDate" class="text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#26A69A]" />
              </div>
              <button @click="fetchRiwayat" class="bg-[#1A2342] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm h-[38px]">
                Filter
              </button>
            </div>
          </div>
  
          <div v-if="isLoadingRiwayat" class="p-12 text-center text-gray-400 text-sm animate-pulse">
            Memuat data...
          </div>
  
          <div v-else-if="riwayatList.length === 0" class="p-12 text-center text-gray-400 text-sm">
            <div class="mb-2 text-3xl">📋</div>
            Belum ada riwayat konseling
          </div>
  
          <table v-else class="w-full text-left">
            <thead class="bg-[#1A2342] text-white">
              <tr>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Siswa</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Tanggal</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Topik</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Jenis Pelanggaran</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Status</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in riwayatList" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-6 py-4">
                  <p class="font-semibold text-slate-700 text-sm">{{ item.siswaNama }}</p>
                  <p class="text-xs text-gray-400 font-mono">{{ item.siswaNisn }}</p>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ formatDate(item.date) }}</td>
                <td class="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate" :title="item.topic">{{ item.topic }}</td>
                <td class="px-6 py-4 text-sm text-slate-500">{{ item.jenisPelanggaran || '-' }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="statusBadgeClass(item.status)" class="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border">
                    {{ statusLabel(item.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="openEditModal(item)"
                      class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDelete(item.id)"
                      class="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- ══════════════════════════════════════════ -->
      <!-- Modal Create Konseling (PK-02)            -->
      <!-- ══════════════════════════════════════════ -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-5 border-b border-slate-100">
            <h2 class="text-lg font-bold text-[#1A2342]">Buat Jadwal Konseling</h2>
            <p class="text-xs text-gray-400 mt-0.5">Isi detail jadwal konseling untuk siswa ini</p>
          </div>
          <div class="px-6 py-5 space-y-4">
            <!-- Info Siswa -->
            <div class="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
              <p class="text-sm font-bold text-[#1A2342]">{{ createTarget?.name }}</p>
              <p class="text-xs text-gray-500 font-mono">{{ createTarget?.nisn }} · {{ createTarget?.kelas }}</p>
            </div>
  
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal <span class="text-red-400">*</span></label>
              <input
                type="date"
                v-model="createForm.date"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
              />
            </div>
  
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Topik <span class="text-red-400">*</span></label>
              <input
                type="text"
                v-model="createForm.topic"
                placeholder="contoh: Keterlambatan berulang"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
              />
            </div>
  
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Jenis Pelanggaran</label>
              <input
                type="text"
                v-model="createForm.violationType"
                placeholder="contoh: TERLAMBAT"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
              />
            </div>
  
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Catatan Awal</label>
              <textarea
                v-model="createForm.initialNotes"
                rows="3"
                placeholder="Catatan awal konseling..."
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition resize-none"
              ></textarea>
            </div>
  
            <div v-if="createError" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {{ createError }}
            </div>
          </div>
          <div class="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
            <button @click="showCreateModal = false" class="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-semibold transition">
              Batal
            </button>
            <button
              @click="submitCreate"
              :disabled="isSubmitting"
              class="px-6 py-2 bg-[#1A2342] text-white rounded-xl text-sm font-bold hover:bg-[#26A69A] transition disabled:opacity-50"
            >
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
  
      <!-- ══════════════════════════════════════════ -->
      <!-- Modal Edit Konseling (PK-05)              -->
      <!-- ══════════════════════════════════════════ -->
      <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-5 border-b border-slate-100">
            <h2 class="text-lg font-bold text-[#1A2342]">Edit Jadwal Konseling</h2>
            <p class="text-xs text-gray-400 mt-0.5">Perbarui detail jadwal konseling</p>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p class="text-sm font-bold text-[#1A2342]">{{ editTarget?.siswaNama }}</p>
              <p class="text-xs text-gray-500 font-mono">{{ editTarget?.siswaNisn }}</p>
            </div>
  
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal</label>
              <input
                type="date"
                v-model="editForm.date"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
              />
            </div>
  
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Topik</label>
              <input
                type="text"
                v-model="editForm.topic"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
              />
            </div>
  
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Jenis Pelanggaran</label>
              <input
                type="text"
                v-model="editForm.violationType"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
              />
            </div>
  
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Catatan Awal</label>
              <textarea
                v-model="editForm.initialNotes"
                rows="3"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition resize-none"
              ></textarea>
            </div>
  
            <div v-if="editError" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {{ editError }}
            </div>
          </div>
          <div class="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
            <button @click="showEditModal = false" class="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-semibold transition">
              Batal
            </button>
            <button
              @click="submitEdit"
              :disabled="isSubmitting"
              class="px-6 py-2 bg-[#1A2342] text-white rounded-xl text-sm font-bold hover:bg-[#26A69A] transition disabled:opacity-50"
            >
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </div>
      </div>
  
      <!-- Toast -->
      <div
        v-if="toast.show"
        class="fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-xl font-semibold text-sm shadow-xl transition-all"
        :class="toast.type === 'success' ? 'bg-[#26A69A] text-white' : 'bg-red-500 text-white'"
      >
        {{ toast.message }}
      </div>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import {
    getSiswaWajibKonseling,
    getRiwayatKonseling,
    createKonseling,
    updateKonseling,
    deleteKonseling,
  } from '@/services/konselingService'
  import type { SiswaWajibKonseling, RiwayatKonseling } from '@/models/konseling'
  
  // ── Tabs ──
  const tabs = [
    { key: 'wajib', label: 'Wajib Konseling' },
    { key: 'riwayat', label: 'Riwayat Konseling' },
  ]
  const activeTab = ref('wajib')
  
  // ── State Wajib ──
  const selectedMonth = ref(new Date().toISOString().slice(0, 7))
  const wajibList = ref<SiswaWajibKonseling[]>([])
  const isLoadingWajib = ref(false)
  
  // ── State Riwayat ──
  const riwayatList = ref<RiwayatKonseling[]>([])
  const isLoadingRiwayat = ref(false)
  const filterStudentId = ref<number | null>(null)
  const filterStartDate = ref('')
  const filterEndDate = ref('')
  
  // ── Modal Create ──
  const showCreateModal = ref(false)
  const createTarget = ref<SiswaWajibKonseling | null>(null)
  const createForm = ref({ date: '', topic: 'Keterlambatan berulang', violationType: 'TERLAMBAT', initialNotes: '' })
  const createError = ref('')
  const isSubmitting = ref(false)
  
  // ── Modal Edit ──
  const showEditModal = ref(false)
  const editTarget = ref<RiwayatKonseling | null>(null)
  const editForm = ref({ date: '', topic: '', violationType: '', initialNotes: '' })
  const editError = ref('')
  
  // ── Toast ──
  const toast = ref({ show: false, message: '', type: 'success' })
  
  // ── Fetch ──
  const fetchWajib = async () => {
    isLoadingWajib.value = true
    try {
      wajibList.value = await getSiswaWajibKonseling(selectedMonth.value)
    } catch {
      showToast('Gagal memuat data wajib konseling', 'error')
    } finally {
      isLoadingWajib.value = false
    }
  }
  
  const fetchRiwayat = async () => {
    isLoadingRiwayat.value = true
    try {
      riwayatList.value = await getRiwayatKonseling(
        filterStudentId.value || undefined,
        filterStartDate.value || undefined,
        filterEndDate.value || undefined
      )
    } catch {
      showToast('Gagal memuat riwayat konseling', 'error')
    } finally {
      isLoadingRiwayat.value = false
    }
  }
  
  // ── Actions ──
  const openCreateModal = (item: SiswaWajibKonseling) => {
    createTarget.value = item
    createForm.value = {
      date: new Date().toISOString().slice(0, 10),
      topic: 'Keterlambatan berulang',
      violationType: 'TERLAMBAT',
      initialNotes: `Siswa terlambat ${item.totalLate}x pada bulan ini`
    }
    createError.value = ''
    showCreateModal.value = true
  }
  
  const submitCreate = async () => {
    if (!createForm.value.date || !createForm.value.topic) {
      createError.value = 'Tanggal dan topik wajib diisi.'
      return
    }
    isSubmitting.value = true
    try {
      await createKonseling({
        studentId: createTarget.value!.studentId,
        date: createForm.value.date,
        topic: createForm.value.topic,
        violationType: createForm.value.violationType || undefined,
        initialNotes: createForm.value.initialNotes || undefined,
      })
      showCreateModal.value = false
      showToast('Jadwal konseling berhasil dibuat!', 'success')
      fetchRiwayat()
    } catch (e: any) {
      createError.value = e.response?.data?.message || 'Gagal membuat jadwal konseling'
    } finally {
      isSubmitting.value = false
    }
  }
  
  const openEditModal = (item: RiwayatKonseling) => {
    editTarget.value = item
    editForm.value = {
      date: item.tanggal,
      topic: item.topik,
      violationType: item.jenisPelanggaran || '',
      initialNotes: item.catatanAwal || '',
    }
    editError.value = ''
    showEditModal.value = true
  }
  
  const submitEdit = async () => {
    isSubmitting.value = true
    try {
      await updateKonseling(editTarget.value!.id, {
        date: editForm.value.date || undefined,
        topic: editForm.value.topic || undefined,
        violationType: editForm.value.violationType || undefined,
        initialNotes: editForm.value.initialNotes || undefined,
      })
      showEditModal.value = false
      showToast('Jadwal konseling berhasil diperbarui!', 'success')
      fetchRiwayat()
    } catch (e: any) {
      editError.value = e.response?.data?.message || 'Gagal mengupdate data'
    } finally {
      isSubmitting.value = false
    }
  }
  
  const confirmDelete = async (id: number) => {
    if (!confirm('Hapus jadwal konseling ini?')) return
    try {
      await deleteKonseling(id)
      showToast('Jadwal konseling berhasil dihapus', 'success')
      fetchRiwayat()
    } catch {
      showToast('Gagal menghapus jadwal konseling', 'error')
    }
  }
  
  // ── Helpers ──
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  
  const statusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'text-yellow-600 border-yellow-200 bg-yellow-50',
      SELESAI: 'text-green-600 border-green-200 bg-green-50',
      PERLU_MONITORING: 'text-orange-600 border-orange-200 bg-orange-50',
    }
    return map[status] || 'text-slate-500 border-slate-200 bg-slate-50'
  }
  
  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'Pending',
      SELESAI: 'Selesai',
      PERLU_MONITORING: 'Perlu Monitor',
    }
    return map[status] || status
  }
  
  const showToast = (message: string, type: 'success' | 'error') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3500)
  }
  
  // ── Watchers ──
  watch(selectedMonth, fetchWajib)
  watch(activeTab, (tab) => {
    if (tab === 'riwayat') fetchRiwayat()
  })
  
  // ── Lifecycle ──
  onMounted(() => {
    fetchWajib()
  })
  </script>