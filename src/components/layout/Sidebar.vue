<template>
  <aside
    :class="[
      'h-screen bg-[#1A2342] flex flex-col fixed left-0 top-0 shadow-xl transition-all duration-300 z-50 overflow-hidden',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <div
      class="relative bg-[#26A69A] flex flex-col items-center justify-center rounded-b-[2rem] shadow-lg mb-8 transition-all duration-300"
      :class="isCollapsed ? 'p-4' : 'p-8'"
    >
      <button
        @click="isCollapsed = !isCollapsed"
        class="absolute top-5 transition-all duration-300 hover:scale-110 text-white"
        :class="isCollapsed ? 'relative mb-2' : 'right-5'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <img
        v-if="!isCollapsed"
        src="@/assets/logo-siabsen.png"
        alt="SiAbsen Logo"
        class="h-14 w-auto drop-shadow-md mt-2"
      />
      <div v-else class="h-8 w-8 flex items-center justify-center font-bold text-white text-xl mt-2">
        S
      </div>
    </div>

    <nav class="flex-grow space-y-1">
      <SidebarItem
        to="/dashboard"
        label="Dashboard"
        :active="route.path === '/dashboard'"
        :isCollapsed="isCollapsed"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        </template>
      </SidebarItem>

      <SidebarItem
        to="/data-siswa"
        label="Data Siswa"
        :active="route.path.startsWith('/data-siswa')"
        :isCollapsed="isCollapsed"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </template>
      </SidebarItem>

      <SidebarItem to="/data-guru" label="Data Guru & Staf" :active="route.path.startsWith('/data-guru')" :isCollapsed="isCollapsed">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </template>
      </SidebarItem>

      <SidebarItem to="/piket" label="Manajemen Piket" :active="route.path === '/piket'" :isCollapsed="isCollapsed">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </template>
      </SidebarItem>

      <SidebarItem to="/data-kelas" label="Data Kelas" :active="route.path === '/data-kelas'" :isCollapsed="isCollapsed">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </template>
      </SidebarItem>

      <SidebarItem to="/laporan" label="Laporan & Rekap" :active="route.path === '/laporan'" :isCollapsed="isCollapsed">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </template>
      </SidebarItem>

      <SidebarItem to="/pengaturan" label="Pengaturan" :active="route.path === '/pengaturan'" :isCollapsed="isCollapsed">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </template>
      </SidebarItem>

      <SidebarItem 
            v-if="authStore.user?.role === 'ADMIN'" 
            to="/accounts" 
            label="Manajemen Akun" 
            :active="route.path === '/accounts'" 
            :isCollapsed="isCollapsed"
          >
            <template #icon>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </template>
          </SidebarItem>
      <SidebarItem 
        to="#" 
        label="Keluar Sistem" 
        :isCollapsed="isCollapsed"
        class="text-red-400 hover:bg-red-900/20"
        @click.prevent="handleLogout"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </template>
      </SidebarItem>

    
    </nav>

    <div class="p-6 border-t border-slate-700 whitespace-nowrap overflow-hidden">
      <p class="text-[10px] text-gray-500 font-inter">SiAbsen v1.0</p>
      <p v-if="!isCollapsed" class="text-xs text-gray-400 font-semibold mt-1">Sistem Informasi SMAN 1 Depok</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './SidebarItem.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const isCollapsed = ref(false)

const handleLogout = async () => {
  if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
    await authStore.logout() 
  }
}
</script>
