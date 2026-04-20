<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { kelasService } from '@/services/kelasService'
import { guruService } from '@/services/guruService'
import { toast } from 'vue-sonner'
import BaseSearch from '@/components/layout/BaseSearch.vue'

// 1. State Management
const kelasList = ref<any[]>([])
const daftarGuru = ref<any[]>([])
const searchQuery = ref('')
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')

// Options untuk Dropdown
const tingkatOptions = ['X', 'XI', 'XII']
const jurusanOptions = ['IPA', 'IPS']

const formKelas = ref({
  id: undefined as number | undefined,
  tingkat: '',
  jurusan: '',
  nomorKelas: '' as string | number,
  guruId: null as number | null,
  tahunAjaran: '2025/2026' // Default value
})

// 2. Logic: Rangkai Nama Kelas Otomatis
// Nama Kelas = Tingkat + Jurusan + Nomor (Contoh: X IPA 1)
const generatedNamaKelas = computed(() => {
  if (!formKelas.value.tingkat || !formKelas.value.jurusan || !formKelas.value.nomorKelas) return '-'
  return `${formKelas.value.tingkat} ${formKelas.value.jurusan} ${formKelas.value.nomorKelas}`
})

// 3. Logic: Validasi Form
const isFormValid = computed(() => {
  return (
    formKelas.value.tingkat !== '' &&
    formKelas.value.jurusan !== '' &&
    formKelas.value.nomorKelas !== '' &&
    formKelas.value.guruId !== null &&
    formKelas.value.tahunAjaran !== ''
  )
})

// 4. Logic: Search & Filter
const filteredKelas = computed(() => {
  if (!kelasList.value) return []
  const query = searchQuery.value.toLowerCase()
  return kelasList.value.filter(k =>
    k.namaKelas.toLowerCase().includes(query) ||
    k.namaWaliKelas.toLowerCase().includes(query)
  )
})

const availableWaliKelas = computed(() => {
  const assignedNipByOtherKelas = new Set(
    kelasList.value
      .filter(k => modalMode.value !== 'edit' || k.id !== formKelas.value.id)
      .map(k => k.nipWaliKelas)
      .filter((nip: string) => nip && nip !== '-')
  )

  return daftarGuru.value.filter(g => g.tipePegawai === 'GURU' && !assignedNipByOtherKelas.has(g.nip))
})

// 5. API Functions
const fetchData = async () => {
  try {
    const [resK, resG] = await Promise.all([
      kelasService.getAll(),
      guruService.getAll()
    ])
    kelasList.value = resK
    daftarGuru.value = resG
  } catch (e) {
    toast.error('Gagal mengambil data dari server')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    const payload = {
      namaKelas: generatedNamaKelas.value, // Hasil rangkaian otomatis
      tingkat: formKelas.value.tingkat,
      jurusan: formKelas.value.jurusan,
      guruId: formKelas.value.guruId,
      tahunAjaran: formKelas.value.tahunAjaran
    }

    if (modalMode.value === 'add') {
      await kelasService.create(payload)
      toast.success('Kelas baru berhasil dibuat')
    } else {
      await kelasService.update(formKelas.value.id!, payload)
      toast.success('Data kelas berhasil diperbarui')
    }

    isModalOpen.value = false
    fetchData()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem')
  }
}

const openModal = (mode: 'add' | 'edit', data: any = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    const guruAsli = daftarGuru.value.find(g => g.nip === data.nipWaliKelas)

    // Pecah nama kelas kembali ke form jika perlu (Asumsi format: "Tingkat Jurusan Nomor")
    const parts = data.namaKelas.split(' ')

    formKelas.value = {
      id: data.id,
      tingkat: data.tingkat || parts[0],
      jurusan: data.jurusan || parts[1],
      nomorKelas: parts[2] || '',
      guruId: guruAsli ? guruAsli.id : null,
      tahunAjaran: data.tahunAjaran || '2025/2026'
    }
  } else {
    formKelas.value = { id: undefined, tingkat: '', jurusan: '', nomorKelas: '', guruId: null, tahunAjaran: '2025/2026' }
  }
  isModalOpen.value = true
}

const handleDelete = async (id: number, nama: string) => {
  if (confirm(`Hapus kelas ${nama}? Semua siswa di kelas ini akan kehilangan asosiasi kelasnya.`)) {
    try {
      await kelasService.delete(id)
      toast.success('Kelas berhasil dihapus')
      fetchData()
    } catch (e) {
      toast.error('Gagal menghapus kelas')
    }
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Manajemen Kelas</h1>
        <p class="text-gray-500">Atur ruang kelas dan penempatan Wali Kelas</p>
      </div>
      <div class="flex items-center gap-4">
        <BaseSearch v-model="searchQuery" placeholder="Cari Nama Kelas atau Wali..." />
        <button @click="openModal('add')" class="bg-[#26A69A] hover:bg-[#1f8a7f] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-teal-100">
          + Tambah Kelas
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left">
      <table class="w-full border-collapse">
        <thead class="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4">Nama Kelas</th>
            <th class="px-6 py-4">Tahun Ajaran</th>
            <th class="px-6 py-4 text-center">Jurusan</th>
            <th class="px-6 py-4">Wali Kelas</th>
            <th class="px-6 py-4 text-center">Siswa</th>
            <th class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="k in filteredKelas" :key="k.id" class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ k.namaKelas }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ k.tahunAjaran || '2025/2026' }}</td>
            <td class="px-6 py-4 text-center">
              <span class="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-black text-gray-600">{{ k.jurusan }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-teal-600 font-bold">{{ k.namaWaliKelas }}</td>
            <td class="px-6 py-4 text-center text-sm font-bold">{{ k.jumlahSiswa }}</td>
            <td class="px-6 py-4">
              <div class="flex justify-center gap-3">
                <button @click="openModal('edit', k)" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="handleDelete(k.id, k.namaKelas)" class="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
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
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-left">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ modalMode === 'add' ? 'Tambah Kelas' : 'Edit Kelas' }}</h3>
          <button @click="isModalOpen = false" class="text-2xl hover:rotate-90 transition-transform">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
          <div class="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 text-center">
            <label class="text-[10px] font-black text-gray-400 uppercase block mb-1">Preview Nama Kelas</label>
            <span class="text-2xl font-black text-[#1A2342]">{{ generatedNamaKelas }}</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Tingkat</label>
              <select v-model="formKelas.tingkat" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required>
                <option value="" disabled>Pilih</option>
                <option v-for="t in tingkatOptions" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Jurusan</label>
              <select v-model="formKelas.jurusan" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required>
                <option value="" disabled>Pilih</option>
                <option v-for="j in jurusanOptions" :key="j" :value="j">{{ j }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Nomor Kelas</label>
              <input v-model="formKelas.nomorKelas" type="number" placeholder="1" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Tahun Ajaran</label>
              <input v-model="formKelas.tahunAjaran" type="text" placeholder="2025/2026" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Pilih Wali Kelas</label>
            <select v-model="formKelas.guruId" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required>
              <option :value="null" disabled>-- Pilih Guru --</option>
              <option v-for="g in availableWaliKelas" :key="g.id" :value="g.id">{{ g.nama }}</option>
            </select>
            <p v-if="availableWaliKelas.length === 0" class="text-[10px] text-amber-600 font-bold ml-1">
              Semua guru sudah menjadi wali kelas.
            </p>
          </div>

          <div class="flex gap-4 pt-6">
            <button type="button" @click="isModalOpen = false" class="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl">Batal</button>
            <button
              type="submit"
              :disabled="!isFormValid"
              :class="['flex-1 py-3 text-white rounded-xl font-bold shadow-xl transition-all', isFormValid ? 'bg-[#1A2342] hover:bg-slate-800' : 'bg-gray-300 cursor-not-allowed']"
            >
              Simpan Kelas
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
