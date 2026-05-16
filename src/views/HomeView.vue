<script setup lang="ts">
import GrafikKehadiranKelas from '@/components/GrafikKehadiranKelas.vue'
import GrafikTrenKehadiran from '@/components/GrafikTrenKehadiran.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <main class="flex-1 p-4 md:p-6 bg-slate-50">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Dashboard</h1>
      <p class="text-slate-500 mb-6">Ringkasan data kehadiran sekolah Anda.</p>

      <GrafikKehadiranKelas />
      
      <GrafikTrenKehadiran v-if="authStore.getUserRole === 'KESISWAAN'" />
    </div>
  </main>
</template>
