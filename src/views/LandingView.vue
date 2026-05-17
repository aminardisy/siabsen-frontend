<template>
  <div class="bg-slate-50 min-h-screen font-inter flex flex-col justify-between">

    <nav class="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-2xl"></span>
          <span class="text-xl font-black text-[#1A2342] tracking-wider">SiAbsen</span>
        </div>

        <div>
          <router-link
            v-if="!isAuthenticated"
            to="/login"
            class="bg-[#1A2342] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
          >
            Masuk Portal
          </router-link>
          <router-link
            v-else
            :to="canAccessDashboard ? '/dashboard' : '/'"
            class="bg-[#26A69A] hover:bg-[#1f8a7f] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
          >
            {{ canAccessDashboard ? 'Buka Dashboard' : 'Sudah Masuk' }}
          </router-link>
        </div>
      </div>
    </nav>

    <header class="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 items-center gap-12 flex-grow">
      <div class="text-left space-y-6">
        <span class="bg-teal-50 border border-teal-200 text-[#26A69A] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          Sistem Informasi Presensi Sekolah
        </span>
        <h1 class="text-4xl md:text-5xl font-black text-[#1A2342] leading-tight">
          Tertib Presensi, <br />
          <span class="text-[#26A69A]">Ukir Prestasi</span> Masa Depan.
        </h1>
        <p class="text-gray-500 text-base md:text-lg leading-relaxed max-w-md">
          Platform digitalisasi absensi dan bimbingan konseling siswa terintegrasi untuk menciptakan lingkungan belajar SMA Negeri yang disiplin, transparan, dan proaktif.
        </p>
        <div class="pt-2">
          <router-link
            to="/login"
            class="inline-block bg-[#1A2342] hover:bg-[#26A69A] text-white text-base font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-slate-200"
          >
            Mulai Presensi Sekarang →
          </router-link>
        </div>
      </div>

      <div class="hidden md:flex justify-center items-center relative">
        <div class="w-80 h-80 bg-teal-100 rounded-full absolute -z-10 blur-3xl opacity-60"></div>
        <div class="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-sm space-y-4">
          <div class="flex items-center gap-3 border-b border-slate-50 pb-3">
            <span class="text-xl"></span>
            <p class="font-bold text-sm text-[#1A2342]">Statistik Aman Sekolah</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-50 p-3 rounded-xl text-center">
              <p class="text-xs text-gray-400 font-semibold">Siswa Aktif</p>
              <p class="text-xl font-black text-[#1A2342] mt-0.5">700+</p>
            </div>
            <div class="bg-slate-50 p-3 rounded-xl text-center">
              <p class="text-xs text-gray-400 font-semibold">Tingkat Kelas</p>
              <p class="text-xl font-black text-[#1A2342] mt-0.5">X, XI, XII</p>
            </div>
          </div>
          <div class="bg-teal-50/50 p-3 rounded-xl border border-teal-100 text-center">
            <p class="text-xs text-[#26A69A] font-bold">Standard Akreditasi A</p>
          </div>
        </div>
      </div>
    </header>

    <footer class="bg-white border-t border-slate-100 py-6 text-center text-xs text-gray-400">
      <p>© 2026 SiAbsen Project · Tim Propen SMAN · Fasilkom Universitas Indonesia</p>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

// Cek apakah user yang sedang login punya hak melihat data dashboard
const canAccessDashboard = computed(() => {
  const role = authStore.user?.role
  return ['ADMIN', 'KESISWAAN', 'WALI_KELAS'].includes(role || '')
})
</script>
