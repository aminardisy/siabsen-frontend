<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue-sonner'
import { accountService } from '@/services/accountService'
import { guruService } from '@/services/guruService'
import { siswaService } from '@/services/siswaService'
import type { AccountResponseDTO } from '@/models/account'

// 1. State Management
const accounts = ref<AccountResponseDTO[]>([])
const daftarGuru = ref<any[]>([])
const daftarSiswa = ref<any[]>([])
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')

const roleOptions = [
  { value: 'ADMIN', label: 'Admin Sistem' },
  { value: 'GURU', label: 'Guru / Wali Kelas' },
  { value: 'SEKRETARIS', label: 'Sekretaris Kelas' },
  { value: 'PIKET', label: 'Guru Piket' },
  { value: 'KESISWAAN', label: 'BK / Kesiswaan / Kepsek' }
]

const formAccount = ref({
  id: '',
  nama: '',
  email: '',
  password: '',
  role: 'GURU',
  guruId: null as number | null,
  siswaId: null as number | null,
  status: 'Aktif',
})

// 2. Logic: Validasi Form
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isEmailInvalid = computed(() => formAccount.value.email.length > 0 && !emailRegex.test(formAccount.value.email))
const isPasswordShort = computed(() => modalMode.value === 'add' && formAccount.value.password.length > 0 && formAccount.value.password.length < 6)

const isFormValid = computed(() => {
  const basicValid = formAccount.value.nama.trim().length > 0 &&
                     emailRegex.test(formAccount.value.email) &&
                     formAccount.value.role !== ''

  // Validasi tambahan: Jika role butuh relasi, ID harus terisi
  const needsGuru = ['GURU', 'PIKET'].includes(formAccount.value.role)
  const needsSiswa = formAccount.value.role === 'SEKRETARIS'

  if (needsGuru && !formAccount.value.guruId) return false
  if (needsSiswa && !formAccount.value.siswaId) return false

  if (modalMode.value === 'add') {
    return basicValid && formAccount.value.password.length >= 6
  }
  return basicValid
})

// 3. API Logic
const fetchData = async () => {
  try {
    // Ambil semua data secara paralel agar cepat
    const [accs, gurs, sisw] = await Promise.all([
      accountService.getAll(),
      guruService.getAll(),
      siswaService.getAll()
    ])
    accounts.value = accs
    daftarGuru.value = gurs
    daftarSiswa.value = sisw
  } catch (error) {
    toast.error('Gagal mengambil data dari server.')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    const payload = {
      nama: formAccount.value.nama,
      email: formAccount.value.email,
      role: formAccount.value.role,
      guruId: ['GURU', 'PIKET'].includes(formAccount.value.role) ? formAccount.value.guruId : null,
      siswaId: formAccount.value.role === 'SEKRETARIS' ? formAccount.value.siswaId : null,
    }

    if (modalMode.value === 'add') {
      await accountService.create({ ...payload, password: formAccount.value.password })
      toast.success('Akun berhasil dibuat dan tersambung')
    } else {
      await accountService.update(formAccount.value.id, payload)
      toast.success('Data akun berhasil diperbarui')
    }
    isModalOpen.value = false
    fetchData()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan data')
  }
}

const handleDelete = async (id: string, nama: string) => {
  if (confirm(`Nonaktifkan akun ${nama}? Akun ini tidak akan bisa login lagi.`)) {
    try {
      await accountService.delete(id)
      toast.success('Akun dinonaktifkan')
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus akun')
    }
  }
}

const openModal = (mode: 'add' | 'edit', data: any = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formAccount.value = {
      id: data.id,
      nama: data.nama,
      email: data.email,
      role: data.role,
      status: data.status,
      password: '',
      guruId: data.guruId || null,
      siswaId: data.siswaId || null
    }
  } else {
    formAccount.value = { id: '', nama: '', email: '', password: '', role: 'GURU', status: 'Aktif', guruId: null, siswaId: null }
  }
  isModalOpen.value = true
}

onMounted(fetchData)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Manajemen Akun Pengguna</h1>
        <p class="text-gray-500">Kelola akses staff, guru, dan admin sistem</p>
      </div>
      <button
        @click="openModal('add')"
        class="bg-[#26A69A] hover:bg-[#1f8a7f] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-100 flex items-center gap-2 transition-all"
      >
        <span>+</span> Tambah Akun
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full border-collapse">
        <thead class="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4">Nama Lengkap</th>
            <th class="px-6 py-4">Email</th>
            <th class="px-6 py-4">Role</th>
            <th class="px-6 py-4 text-center">Status</th>
            <th class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="acc in accounts" :key="acc.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ acc.nama }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ acc.email }}</td>
            <td class="px-6 py-4">
              <span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                {{ acc.role }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="acc.status === 'Aktif' ? 'bg-teal-50 text-[#26A69A]' : 'bg-red-50 text-red-500'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {{ acc.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-4">
                <button @click="openModal('edit', acc)" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="handleDelete(acc.id, acc.nama)" class="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
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
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all text-left">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ modalMode === 'add' ? 'Buat Akun Baru' : 'Edit Akun' }}</h3>
          <button @click="isModalOpen = false" class="text-2xl">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Role Akses</label>
            <select v-model="formAccount.role" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required>
              <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
            </select>
          </div>

          <div v-if="['GURU', 'PIKET'].includes(formAccount.role)" class="space-y-1 animate-in fade-in slide-in-from-top-2">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Sambungkan ke Data Guru</label>
            <select v-model="formAccount.guruId" class="w-full bg-blue-50/50 border border-blue-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" required>
              <option :value="null" disabled>-- Pilih Guru --</option>
              <option v-for="g in daftarGuru" :key="g.id" :value="g.id">{{ g.nama }} ({{ g.jabatan }})</option>
            </select>
          </div>

          <div v-if="formAccount.role === 'SEKRETARIS'" class="space-y-1 animate-in fade-in slide-in-from-top-2">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Sambungkan ke Data Siswa</label>
            <select v-model="formAccount.siswaId" class="w-full bg-purple-50/50 border border-purple-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-400" required>
              <option :value="null" disabled>-- Pilih Siswa --</option>
              <option v-for="s in daftarSiswa" :key="s.id" :value="s.id">{{ s.nama }} - {{ s.namaKelas }}</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Nama Tampilan Akun</label>
            <input v-model="formAccount.nama" type="text" placeholder="Nama yang muncul saat login" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
            <input v-model="formAccount.email" type="email" placeholder="email@sekolah.sch.id" :class="['w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 transition-all', isEmailInvalid ? 'border-red-400 focus:ring-red-100' : 'border-gray-100 focus:ring-[#26A69A]']" required />
          </div>

          <div v-if="modalMode === 'add'" class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
            <input v-model="formAccount.password" type="password" placeholder="Minimal 6 karakter" :class="['w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 transition-all', isPasswordShort ? 'border-red-400 focus:ring-red-100' : 'border-gray-100 focus:ring-[#26A69A]']" required />
          </div>

          <div class="flex gap-4 pt-6">
            <button type="button" @click="isModalOpen = false" class="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-all">Batal</button>
            <button
              type="submit"
              :disabled="!isFormValid"
              :class="['flex-1 py-3 text-white rounded-xl font-bold shadow-xl transition-all', isFormValid ? 'bg-[#1A2342] hover:bg-slate-800' : 'bg-gray-300 cursor-not-allowed']"
            >
              Simpan Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
