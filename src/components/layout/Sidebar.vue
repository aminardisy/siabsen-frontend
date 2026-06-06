<template>
  <aside
    :class="[
      'h-screen bg-[#1A2342] flex flex-col fixed left-0 top-0 shadow-xl transition-all duration-300 z-50 overflow-hidden',
      uiStore.isSidebarCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <div
      class="relative bg-[#26A69A] flex flex-col items-center justify-center rounded-b-[2rem] shadow-lg mb-8 transition-all duration-300"
      :class="uiStore.isSidebarCollapsed ? 'p-6 h-20' : 'p-8'"
    >
      <button
        @click="uiStore.toggleSidebar()"
        class="transition-all duration-300 hover:scale-110 text-white"
        :class="uiStore.isSidebarCollapsed ? 'relative' : 'absolute top-5 right-5'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <img
        v-if="!uiStore.isSidebarCollapsed"
        src="@/assets/SIABSEN (2).png"
        alt="SiAbsen Logo"
        class="h-24 w-auto drop-shadow-md mt-4 transition-all duration-300"
      />
    </div>

    <nav class="grow space-y-1 overflow-y-auto px-2 custom-scrollbar flex flex-col">
      <SidebarItem
        v-if="['GURU', 'KESISWAAN', 'ADMIN'].includes(authStore.user?.role)"
        to="/dashboard"
        label="Dashboard"
        :active="route.path === '/dashboard'"
        :isCollapsed="uiStore.isSidebarCollapsed"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        </template>
      </SidebarItem>

      <template v-if="authStore.user?.role === 'ADMIN'">
        <div class="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest" v-if="!uiStore.isSidebarCollapsed">
          Data Master
        </div>

        <SidebarItem to="/data-siswa" label="Data Siswa" :active="route.path.startsWith('/data-siswa')" :isCollapsed="uiStore.isSidebarCollapsed">
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </template>
        </SidebarItem>

        <SidebarItem to="/data-guru" label="Data Guru" :active="route.path.startsWith('/data-guru')" :isCollapsed="uiStore.isSidebarCollapsed">
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </template>
        </SidebarItem>

        <SidebarItem to="/data-kelas" label="Data Kelas" :active="route.path.startsWith('/data-kelas')" :isCollapsed="uiStore.isSidebarCollapsed">
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </template>
        </SidebarItem>

        <SidebarItem to="/accounts" label="Manajemen Akun" :active="route.path.startsWith('/accounts')" :isCollapsed="uiStore.isSidebarCollapsed">
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </template>
        </SidebarItem>
      </template>

      <div class="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest" v-if="!uiStore.isSidebarCollapsed">
        Sistem Sekolah
      </div>

      <SidebarItem
        v-if="['GURU', 'PIKET', 'ADMIN'].includes(authStore.user?.role)"
        to="/catat-keterlambatan"
        label="Keterlambatan"
        :active="route.path.startsWith('/catat-keterlambatan')"
        :isCollapsed="uiStore.isSidebarCollapsed"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </template>
      </SidebarItem>

      <SidebarItem
        v-if="['GURU', 'ADMIN'].includes(authStore.user?.role)"
        to="/laporan-keterlambatan"
        label="Laporan Keterlambatan"
        :active="route.path.startsWith('/laporan-keterlambatan')"
        :isCollapsed="uiStore.isSidebarCollapsed"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </SidebarItem>

      <SidebarItem
        v-if="['GURU', 'SEKRETARIS', 'ADMIN'].includes(authStore.user?.role)"
        to="/absensi"
        label="Absensi"
        :active="route.path.startsWith('/absensi')"
        :isCollapsed="uiStore.isSidebarCollapsed"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </template>
      </SidebarItem>

      <SidebarItem
        v-if="['GURU', 'SEKRETARIS', 'ADMIN'].includes(authStore.user?.role)"
        to="/janji-temu"
        label="Janji Temu"
        :active="route.path.startsWith('/janji-temu')"
        :isCollapsed="uiStore.isSidebarCollapsed"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </template>
      </SidebarItem>

      <SidebarItem
        v-if="[ 'ADMIN', 'KESISWAAN', 'PIKET'].includes(authStore.user?.role)"
        to="/dispensasi"
        label="Dispensasi & Izin"
        :active="route.path.startsWith('/dispensasi')"
        :isCollapsed="uiStore.isSidebarCollapsed"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </template>
      </SidebarItem>

      <SidebarItem
        v-if="['GURU', 'KESISWAAN', 'ADMIN'].includes(authStore.user?.role)"
        to="/konseling"
        label="Konseling"
        :active="route.path.startsWith('/konseling')"
        :isCollapsed="uiStore.isSidebarCollapsed"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </template>
      </SidebarItem>

      <SidebarItem
        v-if="['GURU', 'KESISWAAN', 'ADMIN'].includes(authStore.user?.role)"
        to="/rekap"
        label="Rekap Absensi"
        :active="route.path.startsWith('/rekap')"
        :isCollapsed="uiStore.isSidebarCollapsed"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </template>
      </SidebarItem>

      <div class="mt-auto pb-4">
        <SidebarItem
          to="#"
          label="Keluar Sistem"
          :active="false"
          :isCollapsed="uiStore.isSidebarCollapsed"
          class="text-red-400 hover:bg-red-900/20"
          @click.prevent="isLogoutModalOpen = true"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </template>
        </SidebarItem>
      </div>
    </nav>

    <div class="p-6 border-t border-slate-700 whitespace-nowrap overflow-hidden">
      <p class="text-[10px] text-gray-500 font-inter">SiAbsen v1.0</p>
      <p v-if="!uiStore.isSidebarCollapsed" class="text-xs text-gray-400 font-semibold mt-1">SMAN 1 Depok</p>
    </div>
  </aside>

  <ConfirmationModal
    :show="isLogoutModalOpen"
    title="Konfirmasi Keluar"
    message="Apakah Anda yakin ingin mengakhiri sesi kerja dan keluar dari sistem aplikasi SiAbsen sekarang?"
    confirm-text="Keluar Sistem"
    cancel-text="Kembali"
    variant="warning"
    @close="isLogoutModalOpen = false"
    @confirm="submitLogout"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue' // FIX: Tambah import ref untuk state lokal
import { useUIStore } from '@/stores/ui'
import { useRoute } from 'vue-router'
import SidebarItem from '@/components/layout/SidebarItem.vue'
import { useAuthStore } from '@/stores/auth'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue' // FIX: Import komponen modal

const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUIStore()

// FIX: State lokal untuk mengontrol visibilitas modal logout
const isLogoutModalOpen = ref(false)

// FIX: Fungsi eksekusi setelah user menyetujui konvensi di dalam modal
const submitLogout = async () => {
  isLogoutModalOpen.value = false
  await authStore.logout()
}
</script>
