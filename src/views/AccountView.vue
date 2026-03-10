<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { accountService } from '@/api/accountService'
import type { AccountResponseDTO } from '@/models/account'

// 1. State Management
const accounts = ref<AccountResponseDTO[]>([])
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')

// State for Form (Matches your DTOs)
const formAccount = ref({
  id: '',
  nama: '',
  email: '',
  password: '', 
  role: 'GURU',
  status: 'Aktif'
})

// 2. API Logic
const fetchAccounts = async () => {
  try {
    accounts.value = await accountService.getAll()
  } catch (error) {
    toast.error('Gagal mengambil data akun.')
  }
}

const handleSubmit = async () => {
  try {
    if (modalMode.value === 'add') {
      await accountService.create({
        nama: formAccount.value.nama,
        email: formAccount.value.email,
        password: formAccount.value.password,
        role: formAccount.value.role
      })
      toast.success('Akun berhasil dibuat')
    } else {
      await accountService.update(formAccount.value.id, {
        nama: formAccount.value.nama,
        email: formAccount.value.email,
        role: formAccount.value.role
      })
      toast.success('Akun berhasil diperbarui')
    }
    isModalOpen.value = false
    fetchAccounts()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Gagal menyimpan data'
    toast.error(msg)
  }
}

const handleDelete = async (id: string, nama: string) => {
  if (confirm(`Nonaktifkan akun ${nama}?`)) {
    try {
      await accountService.delete(id)
      toast.success('Akun dinonaktifkan')
      fetchAccounts()
    } catch (error) {
      toast.error('Gagal menghapus akun')
    }
  }
}

const openModal = (mode: 'add' | 'edit', data: AccountResponseDTO | null = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formAccount.value = { 
      id: data.id, 
      nama: data.nama, 
      email: data.email, 
      role: data.role, 
      status: data.status,
      password: '' // Reset password field for security
    }
  } else {
    formAccount.value = { id: '', nama: '', email: '', password: '', role: 'GURU', status: 'Aktif' }
  }
  isModalOpen.value = true
}

onMounted(fetchAccounts)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Manajemen Akun Pengguna</h1>
        <p class="text-gray-500">Kelola akses staff, guru, dan admin sistem</p>
      </div>
      <button @click="openModal('add')" class="bg-[#26A69A] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-200 flex items-center gap-2">
        <span class="text-xl">+</span> Tambah Akun
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Nama</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Email</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Role</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">Status</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="acc in accounts" :key="acc.id" class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ acc.nama }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ acc.email }}</td>
            <td class="px-6 py-4 text-sm"><span class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{{ acc.role }}</span></td>
            <td class="px-6 py-4 text-center">
              <span :class="acc.status === 'Aktif' ? 'bg-teal-50 text-[#26A69A]' : 'bg-red-50 text-red-500'" class="px-3 py-1 rounded-full text-xs font-bold">
                {{ acc.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openModal('edit', acc)" class="text-blue-500 hover:text-blue-700 font-bold">Edit</button>
                <button @click="handleDelete(acc.id, acc.nama)" class="text-red-400 hover:text-red-600 font-bold">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-[#1A2342]/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ modalMode === 'add' ? 'Buat Akun Baru' : 'Edit Akun' }}</h3>
          <button @click="isModalOpen = false" class="text-2xl">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
          <div>
            <label class="text-xs font-bold text-gray-400 uppercase">Nama Lengkap</label>
            <input v-model="formAccount.nama" type="text" class="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-400 uppercase">Email Address</label>
            <input v-model="formAccount.email" type="email" class="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
          </div>
          <div v-if="modalMode === 'add'">
            <label class="text-xs font-bold text-gray-400 uppercase">Password</label>
            <input v-model="formAccount.password" type="password" class="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-400 uppercase">Role Access</label>
            <select v-model="formAccount.role" class="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]">
              <option value="ADMIN">ADMIN</option>
              <option value="GURU">GURU</option>
              <option value="KESISWAAN">KESISWAAN</option>
            </select>
          </div>

          <div class="flex gap-4 pt-6">
            <button type="button" @click="isModalOpen = false" class="flex-1 py-3 text-gray-400 font-bold">Batal</button>
            <button type="submit" class="flex-1 py-3 bg-[#1A2342] text-white rounded-xl font-bold">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>