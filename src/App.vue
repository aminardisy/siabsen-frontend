<template>
  <div class="min-h-screen bg-gray-50 flex">

    <Sidebar v-if="authStore.isAuthenticated" />

    <main
      :class="[
        'flex-1 transition-all duration-300 ease-in-out min-w-0',
        authStore.isAuthenticated
          ? (uiStore.isSidebarCollapsed ? 'ml-20' : 'ml-64')
          : 'ml-0'
      ]"
    >
      <Navbar v-if="authStore.isAuthenticated" />

      <div :class="authStore.isAuthenticated ? 'p-4 md:p-8' : 'p-0'">
        <router-view />
      </div>
    </main>
  </div>
  <Toaster position="top-right" richColors closeButton />
</template>

<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { Toaster } from 'vue-sonner'

const uiStore = useUIStore()
const authStore = useAuthStore()
</script>
