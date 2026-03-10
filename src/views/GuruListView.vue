<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { guruService } from '@/services/guruService'
import { toast } from 'vue-sonner'

const guruList = ref<any[]>([])
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const formGuru = ref({
  id: undefined as number | undefined,
  nama: '',
  nuptk: '',
  jenisKelamin: 'LAKI_LAKI',
  mataPelajaran: ''
})

const fetchGuru = async () => {
  try {
    guruList.value = await guruService.getAll()
  } catch (e) { toast.error('Gagal ambil data guru') }
}

const openModal = (mode: 'add' | 'edit', data: any = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formGuru.value = { ...data, nuptk: data.nip } // Mapping nip ke nuptk
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
    fetchGuru()
    toast.success('Berhasil simpan data guru')
  } catch (e: any) { toast.error(e.response?.data?.message || 'Gagal') }
}

onMounted(fetchGuru)
</script>

<template>
  <div class="p-8">
    <div class="flex justify-between mb-6">
      <h1 class="text-2xl font-bold">Data Guru</h1>
      <button @click="openModal('add')" class="bg-[#26A69A] text-white px-4 py-2 rounded-xl">+ Tambah Guru</button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
          <tr>
            <th class="px-6 py-4">NIP</th>
            <th class="px-6 py-4">Nama</th>
            <th class="px-6 py-4">Jabatan</th>
            <th class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in guruList" :key="g.id" class="border-t">
            <td class="px-6 py-4">{{ g.nip }}</td>
            <td class="px-6 py-4 font-bold">{{ g.nama }}</td>
            <td class="px-6 py-4">{{ g.jabatan }}</td>
            <td class="px-6 py-4 text-center">
              <button @click="openModal('edit', g)" class="text-blue-500 mr-2">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div class="bg-white p-8 rounded-3xl w-full max-w-md">
        <h3 class="text-xl font-bold mb-6">{{ modalMode === 'add' ? 'Tambah Guru' : 'Edit Guru' }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <input v-model="formGuru.nama" placeholder="Nama Guru" class="w-full border p-3 rounded-xl" required />
          <input v-model="formGuru.nuptk" placeholder="NUPTK" class="w-full border p-3 rounded-xl" required />
          <select v-model="formGuru.jenisKelamin" class="w-full border p-3 rounded-xl">
            <option value="LAKI_LAKI">Laki-laki</option>
            <option value="PEREMPUAN">Perempuan</option>
          </select>
          <input v-model="formGuru.mataPelajaran" placeholder="Mata Pelajaran" class="w-full border p-3 rounded-xl" required />
          <div class="flex gap-4 pt-4">
            <button type="button" @click="isModalOpen = false" class="flex-1">Batal</button>
            <button type="submit" class="flex-1 bg-[#1A2342] text-white py-3 rounded-xl">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
