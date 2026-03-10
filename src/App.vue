<template>
  <div class="flex min-h-screen bg-gray-50 font-inter text-slate-800">
    <Sidebar @toggle="handleSidebarToggle" />

    <div
      :class="[
        'flex-1 flex flex-col transition-all duration-300',
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      ]"
    >
      <Navbar />

      <main class="flex-1">
        <RouterView />
      </main>
    </div>

    <Toaster position="top-right" richColors />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/layout/Sidebar.vue'
import Navbar from './components/layout/Navbar.vue'
import { Toaster } from 'vue-sonner'

const isSidebarCollapsed = ref(false)

// Fungsi untuk menerima sinyal buka-tutup dari sidebar
const handleSidebarToggle = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed
}
</script>
