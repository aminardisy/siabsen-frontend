<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 font-inter p-4 relative overflow-hidden">

    <div class="absolute w-96 h-96 bg-teal-100 rounded-full -top-12 -left-12 blur-3xl opacity-40 pointer-events-none"></div>
    <div class="absolute w-96 h-96 bg-blue-100 rounded-full -bottom-12 -right-12 blur-3xl opacity-40 pointer-events-none"></div>

    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative z-10 transition-all">

      <div class="bg-[#26A69A] p-8 text-center text-white relative">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 class="text-2xl font-black tracking-wide uppercase">SiAbsen APP</h1>
        <p class="text-teal-50 text-xs mt-1 opacity-80 font-medium">Portal Presensi & Informasi SMAN 1 Depok</p>
      </div>

      <form @submit.prevent="handleLogin" class="p-8 space-y-5 text-left">

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Sekolah</label>
          <div class="relative flex items-center">
            <span class="absolute left-4 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
              </svg>
            </span>
            <input
              v-model="email"
              type="email"
              placeholder="nama@sman1depok.sch.id"
              class="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-3.5 rounded-xl outline-none text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#26A69A]/20 focus:border-[#26A69A] transition-all"
              required
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Kata Sandi</label>
          <div class="relative flex items-center">
            <span class="absolute left-4 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-100 pl-12 pr-12 py-3.5 rounded-xl outline-none text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#26A69A]/20 focus:border-[#26A69A] transition-all"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.4M9.695 3.515A10.028 10.028 0 0112 3c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-1.254 0-2.436-.228-3.525-.644M21 21l-2-2m-3-3l-3-3m-2-2L6 6m-3-3l2 2" />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full h-12 bg-[#1A2342] text-white rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg shadow-slate-100 transition-all flex justify-center items-center text-sm active:scale-[0.99]"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Memverifikasi...' : 'Masuk Ke Sistem' }}
        </button>
      </form>

      <div class="p-5 text-center border-t border-slate-50 bg-slate-50/50">
        <p class="text-xs text-slate-400 font-medium">
          Mengalami kendala akun? Hubungi <span class="text-[#26A69A] font-bold cursor-pointer hover:underline">Tim IT SMAN</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()

// State Login
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

// Handle Submit Form
const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast.error('Email dan password wajib diisi!')
    return
  }

  isLoading.value = true
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })

    toast.success(`Selamat Datang Kembali, ${authStore.user?.nama || 'Pengguna'}`)

    const userRole = authStore.user?.role

    if (['ADMIN', 'GURU', 'KESISWAAN'].includes(userRole)) {
      router.push('/dashboard')
    } else if (['SEKRETARIS', 'PIKET'].includes(userRole)) {
      router.push('/workspace')
    } else {
      router.push('/')
    }

  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Email atau Kata Sandi salah!'
    toast.error(errorMsg)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
