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

// State Form (Sesuai KelasRequestDTO: namaKelas, tingkat, jurusan, guruId)
const formKelas = ref({
  id: undefined as number | undefined,
  namaKelas: '',
  tingkat: '',
  jurusan: '',
  guruId: null as number | null
})

// 2. Logic: Search & Filter
const filteredKelas = computed(() => {
  if (!searchQuery.value) return kelasList.value
  const query = searchQuery.value.toLowerCase()
  return kelasList.value.filter(k =>
    k.namaKelas.toLowerCase().includes(query) ||
    k.namaWaliKelas.toLowerCase().includes(query)
  )
})

// 3. API Functions
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

// Fungsi Simpan (Create / Update)
const handleSubmit = async () => {
  try {
    const payload = {
      namaKelas: formKelas.value.namaKelas,
      tingkat: formKelas.value.tingkat,
      jurusan: formKelas.value.jurusan,
      guruId: formKelas.value.guruId
    }

    if (modalMode.value === 'add') {
      await kelasService.create(payload)
      toast.success('Kelas baru berhasil dibuat')
    } else {
      await kelasService.update(formKelas.value.id!, payload)
      toast.success('Data kelas berhasil diperbarui')
    }

    isModalOpen.value = false
    fetchData() // Refresh tabel
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Terjadi kesalahan sistem'
    toast.error(msg)
  }
}

const openModal = (mode: 'add' | 'edit', data: any = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    // Cari ID guru berdasarkan NIP/Nama yang ada di response tabel
    const guruAsli = daftarGuru.value.find(g => g.nip === data.nipWaliKelas)

    formKelas.value = {
      id: data.id,
      namaKelas: data.namaKelas,
      tingkat: data.tingkat,
      jurusan: data.jurusan,
      guruId: guruAsli ? guruAsli.id : null
    }
  } else {
    formKelas.value = { id: undefined, namaKelas: '', tingkat: '', jurusan: '', guruId: null }
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

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4">Nama Kelas</th>
            <th class="px-6 py-4">Tingkat</th>
            <th class="px-6 py-4">Jurusan</th>
            <th class="px-6 py-4">Wali Kelas</th>
            <th class="px-6 py-4 text-center">Jumlah Siswa</th>
            <th class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="k in filteredKelas" :key="k.id" class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ k.namaKelas }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ k.tingkat }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ k.jurusan }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 font-medium text-teal-600">
              {{ k.namaWaliKelas }}
            </td>
            <td class="px-6 py-4 text-center text-sm font-bold">{{ k.jumlahSiswa }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="openModal('edit', k)"
                  class="text-blue-500 hover:text-blue-700 font-bold text-sm"
                >
                  Edit
                </button>

                <button
                  @click="handleDelete(k.id, k.namaKelas)"
                  class="text-red-400 hover:text-red-600 font-bold text-sm"
                >
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A2342]/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ modalMode === 'add' ? 'Tambah Kelas' : 'Edit Kelas' }}</h3>
          <button @click="isModalOpen = false" class="text-2xl hover:rotate-90 transition-transform">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Nama Kelas</label>
            <input v-model="formKelas.namaKelas" type="text" placeholder="X-IPA-1" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Tingkat</label>
              <select v-model="formKelas.tingkat" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none" required>
                <option value="X">X (10)</option>
                <option value="XI">XI (11)</option>
                <option value="XII">XII (12)</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Jurusan</label>
              <input v-model="formKelas.jurusan" type="text" placeholder="IPA" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none" required />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Wali Kelas</label>
            <select v-model="formKelas.guruId" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required>
              <option :value="null" disabled>-- Pilih Guru --</option>
              <option v-for="g in daftarGuru" :key="g.id" :value="g.id">
                {{ g.nama }}
              </option>
            </select>
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
