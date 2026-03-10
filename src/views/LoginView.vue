<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()

// 1. State for Login Credentials
const email = ref('')
const password = ref('')
const isLoading = ref(false)

// 2. Handle Login Logic
const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast.error('Email dan password wajib diisi!')
    return
  }

  isLoading.value = true
  try {
    // This calls the Pinia action we built
    await authStore.login({
      email: email.value,
      password: password.value
    })
    
    toast.success('Selamat Datang, ' + authStore.user.nama)
    router.push('/siswa') // Redirect to the management page
  } catch (error: any) {
    // Grabbing the error message from your BaseResponseDTO
    const errorMsg = error.response?.data?.message || 'Email atau Password salah!'
    toast.error(errorMsg)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 font-inter p-4">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      <div class="bg-[#26A69A] p-10 text-center text-white">
        <h1 class="text-3xl font-bold mb-2">SiAbsen APP</h1>
        <p class="text-teal-50 opacity-90">Sistem Informasi Absensi Sekolah</p>
      </div>

      <form @submit.prevent="handleLogin" class="p-8 space-y-6">
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase ml-1">Email Sekolah</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="john@email.id" 
            class="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] transition-all" 
            required 
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase ml-1">Kata Sandi</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            class="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] transition-all" 
            required 
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full py-4 bg-[#1A2342] text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl transition-all flex justify-center items-center"
        >
          <span v-if="isLoading" class="animate-spin mr-2">◌</span>
          {{ isLoading ? 'Memproses...' : 'Masuk Ke Sistem' }}
        </button>
      </form>

      <div class="p-6 text-center border-t border-gray-50">
        <p class="text-sm text-gray-400 italic">Pastikan Anda menggunakan akun resmi sekolah.</p>
      </div>
    </div>
  </div>
</template>