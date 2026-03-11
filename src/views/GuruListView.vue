<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { guruService } from '@/services/guruService'
import { toast } from 'vue-sonner'
import type { GuruRequest, GuruResponse } from '@/models/guru'
import BaseSearch from '@/components/layout/BaseSearch.vue'

// 1. State Management
const guruList = ref<GuruResponse[]>([])
const searchQuery = ref('')
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')

// State Form dengan Type Safety agar tidak error 'jenisKelamin'
const formGuru = ref<GuruRequest & { id?: number }>({
  id: undefined,
  nama: '',
  nuptk: '',
  jenisKelamin: 'LAKI_LAKI',
  mataPelajaran: ''
})

// 2. Logic: Search & Filter
const filteredGuru = computed(() => {
  if (!guruList.value) return []
  if (!searchQuery.value) return guruList.value

  const query = searchQuery.value.toLowerCase()
  return guruList.value.filter(g =>
    g.nama.toLowerCase().includes(query) ||
    g.nip.includes(query) ||
    g.jabatan.toLowerCase().includes(query)
  )
})

// 3. API Functions
const fetchData = async () => {
  try {
    // Mengambil data dari .items karena Backend menggunakan Pagination
    const res = await guruService.getAll()
    guruList.value = res // Service sudah mengembalikan .items
  } catch (e) {
    toast.error('Gagal memuat data guru')
  }
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

const openModal = (mode: 'add' | 'edit', data: any = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    // Map 'nip' dari response ke 'nuptk' untuk request
    formGuru.value = {
      id: data.id,
      nama: data.nama,
      nuptk: data.nip,
      jenisKelamin: data.jenisKelamin || 'LAKI_LAKI',
      mataPelajaran: data.jabatan // Mapping jabatan ke mapel
    }
  } else {
    formGuru.value = { id: undefined, nama: '', nuptk: '', jenisKelamin: 'LAKI_LAKI', mataPelajaran: '' }
  }
  isModalOpen.value = true
}

const handleSubmit = async () => {
  try {
    if (modalMode.value === 'add') {
      await guruService.create(formGuru.value)
      toast.success('Guru baru berhasil ditambahkan')
    } else {
      await guruService.update(formGuru.value.id!, formGuru.value)
      toast.success('Data guru berhasil diperbarui')
    }
    isModalOpen.value = false
    fetchData()
  } catch (e: any) {
    const errorMsg = e.response?.data?.message || 'Terjadi kesalahan sistem'
    toast.error(errorMsg)
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Manajemen Guru & Staf</h1>
        <p class="text-gray-500">Kelola data tenaga pengajar dan wali kelas sekolah</p>
      </div>
      <div class="flex items-center gap-4">
        <BaseSearch v-model="searchQuery" placeholder="Cari NIP atau Nama..." />
        <button
          @click="openModal('add')"
          class="bg-[#26A69A] hover:bg-[#1f8a7f] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-100 transition-all"
        >
          + Tambah Guru
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4">NIP / NUPTK</th>
            <th class="px-6 py-4">Nama Lengkap</th>
            <th class="px-6 py-4">Jabatan / Mapel</th>
            <th class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="g in filteredGuru" :key="g.id" class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 text-sm font-medium text-gray-500">{{ g.nip }}</td>
            <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ g.nama }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ g.jabatan }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openModal('edit', g)" class="text-blue-500 hover:text-blue-700 font-bold text-sm">Edit</button>
                <button @click="handleDelete(g.id, g.nama)" class="text-red-400 hover:text-red-600 font-bold text-sm">Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredGuru.length === 0" class="p-12 text-center text-gray-400 italic">
        Tidak ada data guru ditemukan...
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A2342]/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ modalMode === 'add' ? 'Tambah Guru Baru' : 'Edit Data Guru' }}</h3>
          <button @click="isModalOpen = false" class="text-2xl hover:rotate-90 transition-transform">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-5 text-left">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Nama Lengkap</label>
            <input
              v-model="formGuru.nama"
              type="text"
              placeholder="Ardi Syahputra, S.Kom"
              class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
              required
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">NUPTK / NIP</label>
            <input
              v-model="formGuru.nuptk"
              type="text"
              placeholder="16 Digit NUPTK"
              class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Jenis Kelamin</label>
              <select v-model="formGuru.jenisKelamin" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]">
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Mata Pelajaran</label>
              <input
                v-model="formGuru.mataPelajaran"
                type="text"
                placeholder="Informatika"
                class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
                required
              />
            </div>
          </div>

          <div class="flex gap-4 pt-6">
            <button
              type="button"
              @click="isModalOpen = false"
              class="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              class="flex-1 py-3 bg-[#1A2342] text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl transition-all"
            >
              {{ modalMode === 'add' ? 'Tambah' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
