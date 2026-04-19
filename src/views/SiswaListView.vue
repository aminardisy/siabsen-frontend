<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { SiswaResponse, SiswaRequest } from '@/models/siswa'
import { siswaService } from '@/services/siswaService'
import { kelasService } from '@/services/kelasService'
import BaseSearch from '@/components/layout/BaseSearch.vue'

// 1. State Management
const siswaList = ref<SiswaResponse[]>([])
const daftarKelas = ref<any[]>([])
const searchQuery = ref('')
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')

// State Form (Sesuai SiswaRequestDTO)
const formSiswa = ref<SiswaRequest & { id?: number }>({
  id: undefined,
  nisn: '',
  nama: '',
  kelasId: null,
  jenisKelamin: 'L',
})

// 2. Logic: Search & Filter (Berdasarkan Nama, NISN, atau Kelas)
const filteredSiswa = computed(() => {
  if (!searchQuery.value) return siswaList.value
  const query = searchQuery.value.toLowerCase()
  return siswaList.value.filter(s =>
    s.nama.toLowerCase().includes(query) ||
    s.nisn.includes(query) ||
    s.namaKelas.toLowerCase().includes(query)
  )
})

// 3. API Functions
const fetchData = async () => {
  try {
    const [resSiswa, resKelas] = await Promise.all([
      siswaService.getAll(),
      kelasService.getAll() // Untuk isi dropdown kelas di modal
    ])
    siswaList.value = resSiswa
    daftarKelas.value = resKelas
  } catch (error) {
    toast.error('Gagal mengambil data dari server')
  }
}

const handleSubmit = async () => {
  try {
    if (modalMode.value === 'add') {
      await siswaService.create(formSiswa.value)
      toast.success('Siswa baru berhasil ditambahkan')
    } else {
      await siswaService.update(formSiswa.value.id!, formSiswa.value)
      toast.success('Data siswa berhasil diperbarui')
    }
    isModalOpen.value = false
    fetchData()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Gagal menyimpan data'
    toast.error(msg)
  }
}

// Fitur Nonaktifkan (Soft Delete / Status Change)
const handleNonaktif = async (id: number, nama: string) => {
  const alasan = prompt(`Mengapa ${nama} dinonaktifkan? (Lulus/Pindah/DO)`, 'Pindah Sekolah')
  if (alasan) {
    try {
      await siswaService.deactivate(id, alasan)
      toast.success(`Status ${nama} berhasil diubah menjadi Nonaktif`)
      fetchData()
    } catch (error) {
      toast.error('Gagal memperbarui status siswa')
    }
  }
}

const openModal = (mode: 'add' | 'edit', data: SiswaResponse | null = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    // Cari ID kelas berdasarkan namaKelas dari data response tabel
    const selectedKelas = daftarKelas.value.find(k => k.namaKelas === data.namaKelas)
    formSiswa.value = {
      id: data.id,
      nisn: data.nisn,
      nama: data.nama,
      kelasId: selectedKelas ? selectedKelas.id : null,
      jenisKelamin: data.jenisKelamin,
    }
  } else {
    formSiswa.value = { id: undefined, nisn: '', nama: '', kelasId: null, jenisKelamin: 'L' }
  }
  isModalOpen.value = true
}

onMounted(fetchData)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Manajemen Data Siswa</h1>
        <p class="text-gray-500">Kelola profil murid dan status keaktifan sekolah</p>
      </div>

      <div class="flex items-center gap-4">
        <BaseSearch v-model="searchQuery" placeholder="Cari Nama, NISN, atau Kelas..." />
        <button @click="openModal('add')" class="bg-[#26A69A] hover:bg-[#1f8a7f] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-teal-100">
          + Tambah Siswa
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4">NISN</th>
            <th class="px-6 py-4">Nama Lengkap</th>
            <th class="px-6 py-4">Kelas</th>
            <th class="px-6 py-4 text-center">L/P</th>
            <th class="px-6 py-4 text-center">Status</th>
            <th class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="s in filteredSiswa" :key="s.id" class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 text-sm font-medium text-gray-500">{{ s.nisn }}</td>
            <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ s.nama }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ s.namaKelas || '-' }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 text-center">{{ s.jenisKelamin }}</td>
            <td class="px-6 py-4 text-center">
              <span :class="s.status === 'Aktif' ? 'bg-teal-50 text-[#26A69A]' : 'bg-red-50 text-red-500'" class="px-3 py-1 rounded-full text-xs font-bold">
                {{ s.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openModal('edit', s)" class="text-blue-500 hover:text-blue-700 font-bold text-sm">Edit</button>
                <button v-if="s.status === 'Aktif'" @click="handleNonaktif(s.id, s.nama)" class="text-red-400 hover:text-red-600 font-bold text-sm">Nonaktifkan</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A2342]/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ modalMode === 'add' ? 'Tambah Siswa Baru' : 'Perbarui Data Siswa' }}</h3>
          <button @click="isModalOpen = false" class="text-2xl hover:rotate-90 transition-transform">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-5 text-left">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase">NISN</label>
            <input v-model="formSiswa.nisn" type="text" maxlength="10" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase">Nama Lengkap</label>
            <input v-model="formSiswa.nama" type="text" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase">Pilih Kelas</label>
              <select v-model="formSiswa.kelasId" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none" required>
                <option :value="null" disabled>-- Pilih Kelas --</option>
                <option v-for="k in daftarKelas" :key="k.id" :value="k.id">{{ k.namaKelas }}</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase">Jenis Kelamin</label>
              <select v-model="formSiswa.jenisKelamin" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>

          <div class="flex gap-4 pt-6">
            <button type="button" @click="isModalOpen = false" class="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-all">Batal</button>
            <button type="submit" class="flex-1 py-3 bg-[#1A2342] text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl transition-all">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
