<template>
  <header class="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
    <nav class="flex text-sm font-medium font-inter">
      <span class="text-gray-400">Admin</span>
      <span class="mx-2 text-gray-300">/</span>
      <span class="text-[#1A2342]">{{ currentPageTitle }}</span>
    </nav>

    <div class="flex items-center gap-3">
      <div class="text-right">
        <p class="text-sm font-bold text-slate-700 leading-none">Ardi S. Amin</p>
        <p class="text-[10px] text-gray-400 font-medium mt-1">Administrator</p>
      </div>
      <div class="w-10 h-10 bg-[#26A69A] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
        AA
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentPageTitle = computed(() => {
  switch (route.path) {
    case '/dashboard': return 'Dashboard'
    case '/data-siswa': return 'Data Siswa'
    case '/data-guru': return 'Data Guru & Staf'
    case '/piket': return 'Manajemen Piket'
    default: return 'SiAbsen'
  }
})
</script>
