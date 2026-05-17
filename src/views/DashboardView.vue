<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dashboardService, type DashboardResponse } from '@/services/dashboardService'
import GrafikKehadiranKelas from '@/components/GrafikKehadiranKelas.vue'
import GrafikTrenKehadiran from '@/components/GrafikTrenKehadiran.vue'

const authStore = useAuthStore()
const userRole = computed(() => authStore.getUserRole)

const isLoading = ref(false)
const errorMsg = ref<string | null>(null)
const dashboardData = ref<DashboardResponse | null>(null)
const activeChartTab = ref<'kelas' | 'tren'>('kelas')
const isModalOpen = ref(false)

const currentYear = new Date().getFullYear()
const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0')
const selectedMonthFilter = ref(`${currentYear}-${currentMonth}`)

const fetchDashboard = async () => {
  isLoading.value = true
  errorMsg.value = null
  try {
    const [yearStr, monthStr] = selectedMonthFilter.value.split('-')
    const year = parseInt(yearStr as string)
    const month = parseInt(monthStr as string)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
    const response = await dashboardService.getDashboardData(startDate, endDate)
    if (response.success) {
      dashboardData.value = response.data
    } else {
      errorMsg.value = response.message || 'Gagal memuat data dashboard.'
    }
  } catch (error: any) {
    console.error(error)
    errorMsg.value = error?.response?.data?.message || 'Terjadi kesalahan pada server.'
  } finally {
    isLoading.value = false
  }
}

watch(selectedMonthFilter, () => {
  if (selectedMonthFilter.value) fetchDashboard()
})

const formatDateIndo = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const pct = (part: number, total: number) => {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

const periodTotal = computed(() => {
  if (!dashboardData.value) return 0
  const p = dashboardData.value.period
  return p.totalHadir + p.totalIzin + p.totalSakit + p.totalAlfa
})

const kelasMenunggu = computed(() => {
  if (!dashboardData.value) return 0
  return dashboardData.value.today.totalKelas - dashboardData.value.today.kelasLapor
})

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-slate-50 font-inter text-left">

    <div class="mb-8">
      <h1 class="text-4xl font-bold text-[#1A2342] mb-1">Dashboard Kehadiran</h1>
      <p class="text-slate-400">Pantau kondisi kehadiran sekolah secara cepat</p>
    </div>

    <div v-if="errorMsg" class="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="font-bold">{{ errorMsg }}</span>
    </div>

    <div v-if="isLoading && !dashboardData" class="flex justify-center py-32">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#26A69A]"></div>
    </div>

    <div v-if="dashboardData" class="animate-fade-in space-y-8">

      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-[#1A2342]">Kondisi Hari Ini</h2>
          <p class="text-sm font-bold text-[#26A69A]">{{ formatDateIndo(dashboardData.today.tanggal) }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <div 
            @click="isModalOpen = true"
            class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 col-span-1 md:col-span-2 cursor-pointer hover:shadow-md hover:border-[#26A69A]/50 transition-all group"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-[#1A2342] text-white flex items-center justify-center flex-shrink-0 group-hover:bg-[#26A69A] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">Status Laporan Kelas</p>
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-black text-[#1A2342]">{{ dashboardData.today.kelasLapor || 0 }}</span>
                    <span class="text-slate-400 font-bold">/ {{ dashboardData.today.totalKelas || 0 }} Kelas Selesai</span>
                  </div>
                </div>
              </div>
              <div class="text-slate-300 group-hover:text-[#26A69A] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
            
            <div class="w-full bg-slate-100 rounded-full h-3 mb-2">
              <div
                class="bg-[#1A2342] group-hover:bg-[#26A69A] h-3 rounded-full transition-all duration-500"
                :style="{ width: `${pct(dashboardData.today.kelasLapor, dashboardData.today.totalKelas)}%` }"
              ></div>
            </div>
            <div class="flex justify-between items-center">
              <span
                v-if="kelasMenunggu > 0"
                class="text-xs font-semibold text-orange-500"
              >{{ kelasMenunggu }} kelas belum lapor</span>
              <span v-else class="text-xs font-semibold text-[#90be6d]">Semua kelas sudah lapor</span>
              <span class="text-xs text-slate-400 font-medium">
                {{ pct(dashboardData.today.kelasLapor, dashboardData.today.totalKelas) }}% Selesai
              </span>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-6 shadow-sm border border-[#90be6d]/30 relative overflow-hidden">
            <div class="absolute -right-4 -bottom-4 opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 text-[#90be6d]" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Siswa Hadir</p>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-4xl font-black text-[#90be6d]">{{ dashboardData.today.hadir || 0 }}</span>
              <span class="text-slate-400 font-bold text-sm">/ {{ dashboardData.today.totalSiswa || 0 }}</span>
              <span
                class="ml-auto text-sm font-black px-2.5 py-0.5 rounded-lg"
                :class="pct(dashboardData.today.hadir, dashboardData.today.totalSiswa) >= 75
                  ? 'bg-green-100 text-[#90be6d]'
                  : 'bg-red-100 text-[#f94144]'"
              >{{ pct(dashboardData.today.hadir, dashboardData.today.totalSiswa) }}%</span>
            </div>
            <div class="flex gap-2 flex-wrap">
              <span class="text-xs font-semibold px-2.5 py-1 bg-red-50 text-[#f94144] rounded-lg">
                Sakit {{ dashboardData.today.sakit || 0 }}
              </span>
              <span class="text-xs font-semibold px-2.5 py-1 bg-yellow-50 text-yellow-500 rounded-lg">
                Izin {{ dashboardData.today.izin || 0 }}
              </span>
              <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">
                Alfa {{ dashboardData.today.alfa || 0 }}
              </span>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <p class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Peringatan Hari Ini</p>
            <div class="flex flex-col gap-3">
              <div class="flex justify-between items-center bg-orange-50 px-4 py-2.5 rounded-xl">
                <span class="text-sm font-bold text-orange-600">Terlambat</span>
                <span class="font-black text-orange-600">{{ dashboardData.today.terlambat || 0 }}</span>
              </div>
              <div class="flex justify-between items-center bg-blue-50 px-4 py-2.5 rounded-xl">
                <span class="text-sm font-bold text-[#577590]">Dispensasi</span>
                <span class="font-black text-[#577590]">{{ dashboardData.today.dispensasi || 0 }}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <hr class="border-slate-200" />

      <section class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
        <div v-if="isLoading" class="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#26A69A]"></div>
        </div>

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 class="text-2xl font-bold text-[#1A2342]">Akumulasi Absensi</h2>
            <p class="text-slate-400">Total data absensi berdasarkan periode bulan</p>
          </div>
          <div class="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-2xl">
            <label class="text-xs font-bold text-slate-400 ml-2 uppercase">Bulan:</label>
            <input
              type="month"
              v-model="selectedMonthFilter"
              class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1A2342] outline-none focus:ring-2 focus:ring-[#26A69A] cursor-pointer"
            />
          </div>
        </div>

        <div class="mb-8">
          <div class="flex h-5 rounded-full overflow-hidden w-full bg-slate-100">
            <div class="bg-[#90be6d] transition-all duration-700 ease-out" :style="{ width: `${pct(dashboardData.period.totalHadir, periodTotal)}%` }"></div>
            <div class="bg-[#f9c74f] transition-all duration-700 ease-out" :style="{ width: `${pct(dashboardData.period.totalIzin, periodTotal)}%` }"></div>
            <div class="bg-[#f94144] transition-all duration-700 ease-out" :style="{ width: `${pct(dashboardData.period.totalSakit, periodTotal)}%` }"></div>
            <div class="bg-slate-300 transition-all duration-700 ease-out" :style="{ width: `${pct(dashboardData.period.totalAlfa, periodTotal)}%` }"></div>
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
            <span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span class="w-2.5 h-2.5 rounded-full bg-[#90be6d] inline-block"></span>
              Hadir {{ pct(dashboardData.period.totalHadir, periodTotal) }}%
            </span>
            <span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span class="w-2.5 h-2.5 rounded-full bg-[#f9c74f] inline-block"></span>
              Izin {{ pct(dashboardData.period.totalIzin, periodTotal) }}%
            </span>
            <span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span class="w-2.5 h-2.5 rounded-full bg-[#f94144] inline-block"></span>
              Sakit {{ pct(dashboardData.period.totalSakit, periodTotal) }}%
            </span>
            <span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span class="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
              Alfa {{ pct(dashboardData.period.totalAlfa, periodTotal) }}%
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div class="bg-green-50 rounded-2xl p-5 border border-green-100">
            <p class="text-3xl font-black text-green-600">{{ dashboardData.period.totalHadir || 0 }}</p>
            <p class="text-sm font-bold text-green-700 mt-1">Total Hadir</p>
            <p class="text-xs font-semibold text-green-500 mt-2">{{ pct(dashboardData.period.totalHadir, periodTotal) }}% dari total</p>
          </div>
          
          <div class="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
            <p class="text-3xl font-black text-yellow-600">{{ dashboardData.period.totalIzin || 0 }}</p>
            <p class="text-sm font-bold text-yellow-700 mt-1">Total Izin</p>
            <p class="text-xs font-semibold text-yellow-500 mt-2">{{ pct(dashboardData.period.totalIzin, periodTotal) }}% dari total</p>
          </div>
          
          <div class="bg-red-50 rounded-2xl p-5 border border-red-100">
            <p class="text-3xl font-black text-red-600">{{ dashboardData.period.totalSakit || 0 }}</p>
            <p class="text-sm font-bold text-red-700 mt-1">Total Sakit</p>
            <p class="text-xs font-semibold text-red-400 mt-2">{{ pct(dashboardData.period.totalSakit, periodTotal) }}% dari total</p>
          </div>
          
          <div class="bg-slate-100 rounded-2xl p-5 border border-slate-200">
            <p class="text-3xl font-black text-slate-600">{{ dashboardData.period.totalAlfa || 0 }}</p>
            <p class="text-sm font-bold text-slate-600 mt-1">Total Alfa</p>
            <p class="text-xs font-semibold text-slate-400 mt-2">{{ pct(dashboardData.period.totalAlfa, periodTotal) }}% dari total</p>
          </div>

          <div class="bg-orange-50 rounded-2xl p-5 border border-orange-100">
            <p class="text-3xl font-black text-orange-600">{{ dashboardData.period.totalTerlambat || 0 }}</p>
            <p class="text-sm font-bold text-orange-700 mt-1">Total Terlambat</p>
            <p class="text-xs font-semibold text-orange-400 mt-2">Peringatan disiplin</p>
          </div>

          <div class="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <p class="text-3xl font-black text-[#577590]">{{ dashboardData.period.totalDispensasi || 0 }}</p>
            <p class="text-sm font-bold text-[#577590] mt-1">Total Dispensasi</p>
            <p class="text-xs font-semibold text-blue-400 mt-2">Disetujui sekolah</p>
          </div>
        </div>

      </section>

      <section>
        <div class="flex items-center gap-4 mb-4">
          <h2 class="text-xl font-bold text-[#1A2342]">Visualisasi & Tren</h2>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div v-if="userRole !== 'GURU'" class="flex border-b border-slate-200 bg-slate-50/50">
            <button
              @click="activeChartTab = 'kelas'"
              :class="[
                'flex-1 px-4 py-3 text-sm font-semibold transition',
                activeChartTab === 'kelas'
                  ? 'text-[#26A69A] bg-white border-b-2 border-[#26A69A]'
                  : 'text-slate-500 hover:text-slate-800'
              ]"
            >
              Kehadiran per Kelas
            </button>
            <button
              v-if="userRole !== 'GURU'"
              @click="activeChartTab = 'tren'"
              :class="[
                'flex-1 px-4 py-3 text-sm font-semibold transition',
                activeChartTab === 'tren'
                  ? 'text-[#26A69A] bg-white border-b-2 border-[#26A69A]'
                  : 'text-slate-500 hover:text-slate-800'
              ]"
            >
              Tren Kehadiran
            </button>
          </div>

          <div class="p-0 sm:p-6 bg-slate-50/30">
            <div v-show="activeChartTab === 'kelas'">
              <GrafikKehadiranKelas />
            </div>
            
            <div v-show="activeChartTab === 'tren' && userRole !== 'GURU'" class="w-full">
              <GrafikTrenKehadiran />
            </div>
          </div>
        </div>
      </section>

    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div class="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 class="text-lg font-bold text-[#1A2342]">Daftar Kelas Belum Lapor</h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div v-if="dashboardData?.today?.kelasBelumLaporList && dashboardData.today.kelasBelumLaporList.length > 0">
            <p class="text-sm text-slate-500 mb-4">Berikut adalah kelas yang belum menyelesaikan laporan absensi pada hari ini:</p>
            <ul class="space-y-3">
              <li v-for="kelas in dashboardData.today.kelasBelumLaporList" :key="kelas" class="px-4 py-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-700 flex items-center gap-3 shadow-sm hover:border-orange-300 transition-colors">
                <div class="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                {{ kelas }}
              </li>
            </ul>
          </div>
          
          <div v-else class="text-center py-8">
             <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
               </svg>
             </div>
             <p class="text-lg font-bold text-[#1A2342]">Semua Selesai!</p>
             <p class="text-slate-500 text-sm mt-1">Seluruh kelas sudah melapor hari ini.</p>
          </div>
        </div>
        
        <div class="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <button @click="isModalOpen = false" class="text-sm font-bold text-slate-500 hover:text-[#1A2342] transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>