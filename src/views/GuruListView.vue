<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { guruService } from '@/services/guruService'
import { toast } from 'vue-sonner'
import type { GuruRequest, GuruResponse } from '@/models/guru'
import BaseSearch from '@/components/layout/BaseSearch.vue'

const guruList = ref<GuruResponse[]>([])
const searchQuery = ref('')
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const formGuru = ref<GuruRequest & { id?: number }>({
  id: undefined,
  nama: '',
  nuptk: '',
  jenisKelamin: 'LAKI_LAKI',
  mataPelajaran: ''
})

const filteredGuru = computed(() => {
  if (!searchQuery.value) return guruList.value
  const query = searchQuery.value.toLowerCase()
  return guruList.value.filter(g =>
    g.nama.toLowerCase().includes(query) || g.nip.includes(query)
  )
})

const fetchData = async () => {
  try {
    guruList.value = await guruService.getAll()
  } catch (e) { toast.error('Gagal memuat data guru') }
}

const handleDelete = async (id: number, nama: string) => {
  if (confirm(`Apakah Anda yakin ingin menghapus data guru ${nama}?`)) {
    try {
      await guruService.delete(id)
      toast.success('Data guru berhasil dihapus')
      fetchData()
    } catch (e) { toast.error('Gagal menghapus data. Guru mungkin masih menjadi Wali Kelas.') }
  }
}

const openModal = (mode: 'add' | 'edit', data: any = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formGuru.value = { ...data, nuptk: data.nip }
  } else {
    formGuru.value = { id: undefined, nama: '', nuptk: '', jenisKelamin: 'LAKI_LAKI', mataPelajaran: '' }
  }
  isModalOpen.value = true
}

const handleSubmit = async () => {
  try {
    if (modalMode.value === 'add') await guruService.create(formGuru.value)
    else await guruService.update(formGuru.value.id!, formGuru.value)
    isModalOpen.value = false
    fetchData()
    toast.success('Simpan data berhasil')
  } catch (e: any) { toast.error(e.response?.data?.message || 'Gagal') }
}

onMounted(fetchData)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Manajemen Guru & Staf</h1>
        <p class="text-gray-500">Kelola data tenaga pengajar dan wali kelas</p>
      </div>
      <div class="flex items-center gap-4">
        <BaseSearch v-model="searchQuery" placeholder="Cari NIP atau Nama..." />
        <button @click="openModal('add')" class="bg-[#26A69A] hover:bg-[#1f8a7f] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-100 transition-all">
          + Tambah Guru
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left">
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
    </div>

    </div>
</template>
