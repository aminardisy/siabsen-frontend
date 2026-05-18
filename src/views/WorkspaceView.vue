<template>
  <div class="p-4 sm:p-6 bg-slate-50 min-h-screen font-inter text-left">

    <div class="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
      <div class="absolute -right-10 -top-10 w-64 h-64 bg-[#26A69A] opacity-[0.03] rounded-full"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 bg-teal-50 text-[#26A69A] px-4 py-1.5 rounded-full mb-4">
            <span class="w-2 h-2 rounded-full bg-[#26A69A] animate-pulse"></span>
            <span class="text-[10px] font-black uppercase tracking-widest">Workspace Aktif</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-[#1A2342] leading-tight">
            Selamat Bertugas,<br>
            <span class="text-[#26A69A]">{{ authStore.user?.nama }}</span>
          </h1>
          <p class="text-slate-400 mt-4 text-sm sm:text-base font-medium leading-relaxed">
            Selamat datang di Portal Operasional SiAbsen SMAN 1 Depok.
            Silakan kelola data presensi sesuai dengan peran dan tanggung jawab Anda hari ini.
          </p>
        </div>

        <div class="flex-shrink-0">
          <div class="w-32 h-32 sm:w-40 sm:h-40 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 shadow-inner">
             <svg v-if="userRole === 'SEKRETARIS'" xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-[#26A69A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
             </svg>
             <svg v-if="userRole === 'PIKET'" xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <div class="lg:col-span-8 space-y-6">
        <h2 class="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Tugas Utama Anda</h2>

        <div v-if="userRole === 'SEKRETARIS'" class="group cursor-pointer" @click="router.push('/absensi')">
          <div class="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-[#26A69A] transition-all relative overflow-hidden">
            <div class="flex items-start gap-6">
              <div class="p-4 bg-teal-50 text-[#26A69A] rounded-2xl group-hover:bg-[#26A69A] group-hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-[#1A2342]">Pencatatan Absensi Harian</h3>
                <p class="text-slate-400 text-sm mt-2 leading-relaxed">
                  Lakukan pengisian kehadiran teman sekelasmu secara akurat. Pastikan data sudah dikirim sebelum batas waktu yang ditentukan sekolah.
                </p>
                <div class="mt-6 flex items-center text-[#26A69A] font-bold text-sm">
                  Mulai Mencatat
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="userRole === 'PIKET'" class="group cursor-pointer" @click="router.push('/catat-keterlambatan')">
          <div class="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-orange-500 transition-all">
            <div class="flex items-start gap-6">
              <div class="p-4 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-[#1A2342]">Pencatatan Gerbang Pagi</h3>
                <p class="text-slate-400 text-sm mt-2 leading-relaxed">
                  Catat siswa yang datang terlambat di gerbang sekolah. Data ini akan langsung terhubung ke sistem poin kesiswaan dan Guru BK.
                </p>
                <div class="mt-6 flex items-center text-orange-500 font-bold text-sm">
                  Buka Menu Catat
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-4 space-y-6">
        <h2 class="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Panduan</h2>
        <div class="bg-[#1A2342] rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="font-bold text-lg mb-4">Yang Harus Dilakukan:</h3>
            <ul v-if="userRole === 'SEKRETARIS'" class="space-y-4 text-xs text-slate-300 font-medium">
              <li class="flex items-start gap-3">
                <span class="text-teal-400">01.</span> Pilih kelas yang sesuai dengan penugasan Anda.
              </li>
              <li class="flex items-start gap-3">
                <span class="text-teal-400">02.</span> Pastikan status (Sakit/Izin) didukung bukti surat.
              </li>
              <li class="flex items-start gap-3">
                <span class="text-teal-400">03.</span> Klik "Kirim Laporan" jika data sudah final.
              </li>
            </ul>
            <ul v-if="userRole === 'PIKET'" class="space-y-4 text-xs text-slate-300 font-medium">
              <li class="flex items-start gap-3">
                <span class="text-orange-400">01.</span> Siaga di gerbang sebelum pukul 07.00 WIB.
              </li>
              <li class="flex items-start gap-3">
                <span class="text-orange-400">02.</span> Catat siswa yang terlambat atau dispen.
              </li>
              <li class="flex items-start gap-3">
                <span class="text-orange-400">03.</span> Berikan dispensasi hanya jika ada instruksi khusus.
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.role || '')
</script>
