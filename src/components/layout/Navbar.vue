<template>
  <header class="bg-white border-b border-slate-100 h-20 fixed top-0 right-0 z-40 flex items-center justify-between px-6 transition-all duration-300"
    :class="uiStore.isSidebarCollapsed ? 'left-20' : 'left-0 lg:left-64'"
  >
    <div class="flex items-center gap-4">
      <button
        @click="uiStore.toggleSidebar()"
        type="button"
        class="lg:hidden p-2 text-slate-500 hover:text-[#1A2342] hover:bg-slate-50 rounded-xl transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <nav class="hidden sm:flex items-center space-x-2 text-xs font-semibold tracking-wide uppercase">
        <router-link :to="portalLink" class="text-slate-400 hover:text-[#26A69A] transition-colors">
          Portal
        </router-link>

        <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
          <span class="text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <span
            :class="idx === breadcrumbs.length - 1 ? 'text-[#1A2342] font-bold' : 'text-slate-400'"
            class="truncate max-w-[120px] sm:max-w-none"
          >
            {{ crumb.metaName }}
          </span>
        </template>
      </nav>
    </div>

    <div class="flex items-center gap-4">

      <div class="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Sistem Online
      </div>

      <div class="flex items-center gap-3 pl-4 border-l border-slate-100">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-bold text-[#1A2342] leading-tight">{{ authStore.user?.nama || 'Pengguna Sistem' }}</p>
          <p class="text-[10px] font-bold text-[#26A69A] uppercase tracking-widest mt-0.5">{{ authStore.user?.role || 'Guest' }}</p>
        </div>

        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A2342] to-[#2a3764] text-white font-mono font-bold text-sm flex items-center justify-center shadow-md shadow-slate-200 uppercase select-none">
          {{ userInitials }}
        </div>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const uiStore = useUIStore()
const authStore = useAuthStore()

const userInitials = computed(() => {
  const name = authStore.user?.nama || 'PS'
  const parts = name.trim().split(' ')
  if (parts.length > 1) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`
  }
  return name.substring(0, 2)
})

const breadcrumbsMap: Record<string, string> = {
  'dashboard': 'Dashboard',
  'data-siswa': 'Data Siswa',
  'data-guru': 'Data Guru',
  'data-kelas': 'Data Kelas',
  'accounts': 'Manajemen Akun',
  'catat-keterlambatan': 'Pencatatan Keterlambatan',
  'laporan-keterlambatan': 'Laporan Keterlambatan',
  'absensi': 'Presensi Kelas',
  'janji-temu': 'Janji Temu',
  'dispensasi': 'Dispensasi & Izin',
  'konseling': 'Konseling Siswa',
  'rekap': 'Rekap Absensi'
}

const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter(p => p)
  return pathArray.map((path) => {
    return {
      path: path,
      metaName: breadcrumbsMap[path] || path.replace(/-/g, ' ')
    }
  })
})

const portalLink = computed(() => {
  const userRole = authStore.user?.role

  if (['ADMIN', 'GURU', 'KESISWAAN'].includes(userRole)) {
    return '/dashboard'
  } else if (['SEKRETARIS', 'PIKET'].includes(userRole)) {
    return '/workspace'
  } else {
    return '/'
  }
})
</script>

<style scoped>
/* Menjamin teks breadcrumb mematuhi inter font */
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
