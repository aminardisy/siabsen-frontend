<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { guruService, importGuruExcel } from '@/services/guruService'
import { toast } from 'vue-sonner'
import type { GuruRequest, GuruResponse } from '@/models/guru'
import BaseSearch from '@/components/layout/BaseSearch.vue'

// 1. State Management
const guruList = ref<GuruResponse[]>([])
const searchQuery = ref('')
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')

// Options untuk Dropdown
const mapelOptions = ['Informatika', 'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Biologi', 'Seni Budaya', 'PJOK']
const tipePegawaiOptions: Array<{ label: string, value: 'GURU' | 'STAF' }> = [
  { label: 'GURU', value: 'GURU' },
  { label: 'STAF', value: 'STAF' }
]

const formGuru = ref<GuruRequest & { id?: number }>({
  id: undefined,
  nama: '',
  nuptk: '',
  jenisKelamin: 'LAKI_LAKI',
  mataPelajaran: '',
  tipePegawai: 'GURU'
})

const isGuruType = computed(() => formGuru.value.tipePegawai === 'GURU')

// 2. Logic: Validasi
const isNuptkInvalid = computed(() => {
  const val = formGuru.value.nuptk
  return val.length > 0 && val.length !== 16
})

const isFormValid = computed(() => {
  const isMapelValid = !isGuruType.value || (formGuru.value.mataPelajaran?.trim() ?? '').length > 0

  return (
    formGuru.value.nama.trim().length > 0 &&
    formGuru.value.nuptk.length === 16 &&
    isMapelValid &&
    !isNuptkInvalid.value
  )
})

// 3. Logic: Search & Filter
const filteredGuru = computed(() => {
  if (!guruList.value) return []
  const query = searchQuery.value.toLowerCase()
  return guruList.value.filter(g =>
    g.nama.toLowerCase().includes(query) ||
    g.nip.includes(query) ||
    g.jabatan.toLowerCase().includes(query)
  )
})

// 4. API Functions
const fetchData = async () => {
  try {
    const res = await guruService.getAll()
    guruList.value = res
  } catch (e) {
    toast.error('Gagal memuat data guru')
  }
}

const handleNuptkInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  // Hanya izinkan angka
  formGuru.value.nuptk = target.value.replace(/\D/g, '').slice(0, 16)
}

const handleDelete = async (id: number, nama: string) => {
  if (confirm(`Apakah Anda yakin ingin menghapus data guru ${nama}?`)) {
    try {
      await guruService.delete(id)
      toast.success('Data guru berhasil dihapus')
      fetchData()
    } catch (e) {
      toast.error('Gagal menghapus data. Guru mungkin masih menjabat sebagai Wali Kelas.')
    }
  }
}

const fileInputGuru = ref<HTMLInputElement | null>(null)

const handleImportGuru = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    try {
      const res = await importGuruExcel(file)
      toast.success(res.message || 'Data guru/staf berhasil diimpor!')
      fetchData() // Auto-refresh isi tabel guru
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengimpor data guru. Pastikan NUPTK tepat 16 digit angka.')
    } finally {
      target.value = '' // Reset input file
    }
  }
}

const openModal = (mode: 'add' | 'edit', data: any = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formGuru.value = {
      id: data.id,
      nama: data.nama,
      nuptk: data.nip,
      jenisKelamin: data.jenisKelamin || 'LAKI_LAKI',
      mataPelajaran: data.jabatan,
      tipePegawai: (data.tipePegawai as 'GURU' | 'STAF') || 'GURU'
    }
  } else {
    formGuru.value = { id: undefined, nama: '', nuptk: '', jenisKelamin: 'LAKI_LAKI', mataPelajaran: '', tipePegawai: 'GURU' }
  }
  isModalOpen.value = true
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  const payload: GuruRequest = {
    ...formGuru.value,
    mataPelajaran: isGuruType.value ? formGuru.value.mataPelajaran : ''
  }

  try {
    if (modalMode.value === 'add') {
      await guruService.create(payload)
      toast.success('Guru baru berhasil ditambahkan')
    } else {
      await guruService.update(formGuru.value.id!, payload)
      toast.success('Data guru berhasil diperbarui')
    }
    isModalOpen.value = false
    fetchData()
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Terjadi kesalahan sistem')
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 text-left">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Manajemen Guru & Staf</h1>
        <p class="text-gray-500 text-sm">Kelola data tenaga pengajar dan wali kelas sekolah</p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        <BaseSearch v-model="searchQuery" placeholder="Cari NUPTK atau Nama..." class="w-full sm:w-64 h-11" />

        <input type="file" ref="fileInputGuru" class="hidden" accept=".xlsx, .xls" @change="handleImportGuru" />

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="/templates/Template_Import_Guru.xlsx"
            download="Template_Import_Guru.xlsx"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Template
          </a>

          <button
            @click="fileInputGuru?.click()"
            type="button"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-[#1A2342] rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Import
          </button>

          <button
            @click="openModal('add')"
            type="button"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 h-11 px-5 bg-[#26A69A] hover:bg-[#1f8a7f] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-100/50 whitespace-nowrap"
          >
            <span>+</span> Guru
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left">
      <table class="w-full border-collapse">
        <thead class="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4">NUPTK / NIP</th>
            <th class="px-6 py-4">Nama Lengkap</th>
            <th class="px-6 py-4">Tipe</th>
            <th class="px-6 py-4">Mata Pelajaran</th>
            <th class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="g in filteredGuru" :key="g.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-gray-500 font-mono">{{ g.nip }}</td>
            <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ g.nama }}</td>
            <td class="px-6 py-4">
              <span :class="[
                'px-3 py-1 rounded-full text-[10px] font-black',
                g.tipePegawai === 'GURU' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
              ]">
                {{ g.tipePegawai }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ g.jabatan }}</td>
            <td class="px-6 py-4">
              <div class="flex justify-center gap-4">
                <button @click="openModal('edit', g)" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="handleDelete(g.id, g.nama)" class="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A2342]/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ modalMode === 'add' ? 'Tambah Guru Baru' : 'Edit Data Guru' }}</h3>
          <button @click="isModalOpen = false" class="text-2xl hover:rotate-90 transition-transform">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Tipe Pegawai</label>
            <div class="flex gap-2">
              <button
                v-for="tipe in tipePegawaiOptions" :key="tipe.value"
                type="button"
                @click="formGuru.tipePegawai = tipe.value"
                :class="[
                  'flex-1 py-2 rounded-xl text-xs font-black transition-all border',
                  formGuru.tipePegawai === tipe.value
                    ? 'bg-[#1A2342] text-white border-[#1A2342]'
                    : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                ]"
              >
                {{ tipe.label }}
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Nama Lengkap</label>
            <input v-model="formGuru.nama" type="text" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">NUPTK (16 Digit)</label>
            <input
              v-model="formGuru.nuptk"
              @input="handleNuptkInput"
              type="text"
              :class="['w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 transition-all', isNuptkInvalid ? 'border-red-400 focus:ring-red-100' : 'border-gray-100 focus:ring-[#26A69A]']"
              placeholder="Contoh: 1234567890123456"
              required
            />
            <p v-if="isNuptkInvalid" class="text-[10px] text-red-500 font-bold ml-1 animate-pulse">
              NUPTK harus 16 digit (Saat ini: {{ formGuru.nuptk.length }})
            </p>
          </div>

          <div :class="['grid gap-4', isGuruType ? 'grid-cols-2' : 'grid-cols-1']">
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Jenis Kelamin</label>
              <select v-model="formGuru.jenisKelamin" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]">
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>
            <div v-if="isGuruType" class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Mata Pelajaran *</label>
              <select
                v-model="formGuru.mataPelajaran"
                class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
                required
              >
                <option value="" disabled>Pilih Mapel</option>
                <option v-for="opt in mapelOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <div class="flex gap-4 pt-6">
            <button type="button" @click="isModalOpen = false" class="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl">Batal</button>
            <button
              type="submit"
              :disabled="!isFormValid"
              :class="['flex-1 py-3 text-white rounded-xl font-bold shadow-xl transition-all', isFormValid ? 'bg-[#1A2342] hover:bg-slate-800' : 'bg-gray-300 cursor-not-allowed']"
            >
              {{ modalMode === 'add' ? 'Tambah' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
