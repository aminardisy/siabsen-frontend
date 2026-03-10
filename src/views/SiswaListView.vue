<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { toast } from 'vue-sonner'
import BaseSearch from '@/components/layout/BaseSearch.vue' // Import komponen reusable

// 1. Definisi Interface sesuai Model di Backend
interface Siswa {
  id: number | null;
  nisn: string;
  namaLengkap: string;
  kelas: string;
  jenisKelamin: string;
  waliKelas: string;
  status: string;
}

// 2. State Management
const searchQuery = ref('')
const siswa = ref<Siswa[]>([])
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')

// 3. Logika Filter Reaktif (Computed)
// Tabel akan otomatis update saat searchQuery berubah
const filteredSiswa = computed(() => {
  if (!searchQuery.value) return siswa.value

  const query = searchQuery.value.toLowerCase()
  return siswa.value.filter(s =>
    s.namaLengkap.toLowerCase().includes(query) ||
    s.nisn.includes(query) ||
    s.kelas.toLowerCase().includes(query)
  )
})

// State untuk Form Modal
const formSiswa = ref<Siswa>({
  id: null,
  nisn: '',
  namaLengkap: '',
  kelas: '',
  jenisKelamin: 'L',
  waliKelas: '',
  status: 'Aktif'
})

// 4. Fungsi API (Integrasi Backend)
const fetchSiswa = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/siswa')
    siswa.value = response.data
  } catch (error) {
    toast.error('Gagal mengambil data dari server')
  }
}

const openModal = (mode: 'add' | 'edit', data: Siswa | null = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formSiswa.value = { ...data } // Copy data agar tidak reaktif langsung ke tabel
  } else {
    // Reset form untuk mode tambah
    formSiswa.value = { id: null, nisn: '', namaLengkap: '', kelas: '', jenisKelamin: 'L', waliKelas: '', status: 'Aktif' }
  }
  isModalOpen.value = true
}

const handleSubmit = async () => {
  try {
    if (modalMode.value === 'add') {
      await axios.post('http://localhost:8080/api/siswa', formSiswa.value)
      toast.success('Siswa baru berhasil ditambahkan')
    } else {
      await axios.put(`http://localhost:8080/api/siswa/${formSiswa.value.id}`, formSiswa.value)
      toast.success('Data siswa berhasil diperbarui')
    }
    isModalOpen.value = false
    fetchSiswa() // Refresh data asli
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Gagal menyimpan data'
    toast.error(msg)
  }
}

const handleNonaktif = async (id: number, nama: string) => {
  const alasan = prompt(`Mengapa ${nama} dinonaktifkan? (Lulus/Pindah/DO)`, "Pindah")
  if (alasan) {
    try {
      await axios.patch(`http://localhost:8080/api/siswa/${id}/nonaktif`, { alasan })
      toast.success(`${nama} berhasil dinonaktifkan`)
      fetchSiswa()
    } catch (error) {
      toast.error('Gagal memperbarui status')
    }
  }
}

onMounted(fetchSiswa)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Manajemen Data Siswa</h1>
        <p class="text-gray-500">Kelola informasi murid dan status keaktifan sekolah</p>
      </div>

      <div class="flex items-center gap-4">
        <BaseSearch
          v-model="searchQuery"
          placeholder="Cari Nama, NISN, atau Kelas..."
        />
        <button
          @click="openModal('add')"
          class="bg-[#26A69A] hover:bg-[#1f8a7f] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-200 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <span class="text-xl">+</span> Tambah Siswa
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">NISN</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kelas</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">L/P</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Wali Kelas</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="s in filteredSiswa" :key="s.id!" class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 text-sm font-medium text-gray-500">{{ s.nisn }}</td>
            <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ s.namaLengkap }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ s.kelas }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 text-center">{{ s.jenisKelamin }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ s.waliKelas }}</td>
            <td class="px-6 py-4 text-center">
              <span
                :class="s.status === 'Aktif' ? 'bg-teal-50 text-[#26A69A]' : 'bg-red-50 text-red-500'"
                class="px-3 py-1 rounded-full text-xs font-bold"
              >
                {{ s.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openModal('edit', s)" class="text-blue-500 hover:text-blue-700 font-bold text-sm">Edit</button>
                <button @click="handleNonaktif(s.id!, s.namaLengkap)" class="text-red-400 hover:text-red-600 font-bold text-sm">Nonaktif</button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredSiswa.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-gray-400 italic">
              Data siswa tidak ditemukan...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-[#1A2342]/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ modalMode === 'add' ? 'Tambah Siswa Baru' : 'Perbarui Data Siswa' }}</h3>
          <button @click="isModalOpen = false" class="text-2xl hover:rotate-90 transition-transform">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-5 text-left">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">NISN</label>
            <input v-model="formSiswa.nisn" type="text" maxlength="10" placeholder="Masukkan 10 digit NISN" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] transition-all" required />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Nama Lengkap</label>
            <input v-model="formSiswa.namaLengkap" type="text" placeholder="Masukkan nama murid" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] transition-all" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Kelas</label>
              <input v-model="formSiswa.kelas" type="text" placeholder="X-IPA-1" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] transition-all" required />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Jenis Kelamin</label>
              <select v-model="formSiswa.jenisKelamin" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] transition-all">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Wali Kelas</label>
            <input v-model="formSiswa.waliKelas" type="text" placeholder="Nama Guru Wali" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] transition-all" required />
          </div>

          <div class="flex gap-4 pt-6">
            <button type="button" @click="isModalOpen = false" class="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl">Batal</button>
            <button type="submit" class="flex-1 py-3 bg-[#1A2342] text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl transition-all">
              {{ modalMode === 'add' ? 'Simpan' : 'Update' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
