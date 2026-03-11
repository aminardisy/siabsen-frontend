<template>
  <header class="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
    <nav class="flex text-sm font-medium font-inter">
      <span class="text-gray-400">Admin</span>
      <span class="mx-2 text-gray-300">/</span>
      <span class="text-[#1A2342]">{{ currentPageTitle }}</span>
    </nav>

    <div class="flex items-center gap-3">
      <div class="text-right">
        <p class="text-sm font-bold text-slate-700 leading-none">
          {{ authStore.user?.nama || 'User' }}
        </p>
        <p class="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
          {{ authStore.user?.role || 'Guest' }}
        </p>
      </div>

      <div class="w-10 h-10 bg-[#26A69A] rounded-full flex items-center justify-center text-white font-bold shadow-sm border-2 border-white ring-1 ring-gray-100">
        {{ userInitials }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const currentPageTitle = computed(() => {
  const path = route.path
  if (path === '/') return 'Dashboard'
  if (path.startsWith('/data-siswa')) return 'Data Siswa'
  if (path.startsWith('/data-guru')) return 'Data Guru & Staf'
  if (path.startsWith('/data-kelas')) return 'Data Kelas'
  if (path.startsWith('/accounts')) return 'Manajemen Akun'
  if (path.startsWith('/roles')) return 'Manajemen Role'
  return 'SiAbsen'
})

const userInitials = computed(() => {
  const name = authStore.user?.nama || ''
  if (!name) return '?'

  const names = name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})
</script>
