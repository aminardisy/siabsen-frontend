<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { absensiService, type RekapDashboardResponse } from '@/services/absensiService'
import { kelasService } from '@/services/kelasService'
import { siswaService } from '@/services/siswaService'
import StudentAttendanceCalendar from '@/components/StudentAttendanceCalendar.vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels' // <-- IMPORT PLUGIN BARU

// Register plugin datalabels
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

// --- State UI & Dropdown Mentah ---
const rekapMode = ref<'KELAS' | 'SISWA'>('SISWA')
const isDropdownOpen = ref(false)
const searchQuery = ref('')
const isLoading = ref(false)

const daftarKelas = ref<any[]>([])
const daftarSiswa = ref<any[]>([])

// --- State Dashboard Data ---
const dashboardData = ref<RekapDashboardResponse | null>(null)
const timeScope = ref<'OVERALL' | 'MONTHLY'>('OVERALL')
const selectedTargetId = ref<number | null>(null)

// State dari Kalender (diupdate via emit)
const calendarMonth = ref(new Date().getMonth())
const calendarYear = ref(new Date().getFullYear())

// --- Logic Academic Year ---
const getAcademicYearBounds = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0 = Jan, 6 = Jul
  const startYear = month >= 6 ? year : year - 1
  return {
    startDate: `${startYear}-07-01`,
    endDate: `${startYear + 1}-06-30`
  }
}

// --- Fetching Logic ---
const fetchDropdownData = async () => {
  try {
    const [resKelas, resSiswa] = await Promise.all([kelasService.getAll(), siswaService.getAll()])
    daftarKelas.value = resKelas
    daftarSiswa.value = Array.isArray(resSiswa) ? resSiswa : (resSiswa as any).data || []
  } catch (error) {
    console.error('Failed to load dropdowns', error)
  }
}

const loadDashboardData = async (id: number, mode: 'KELAS' | 'SISWA') => {
  isLoading.value = true
  isDropdownOpen.value = false
  selectedTargetId.value = id
  rekapMode.value = mode
  searchQuery.value = ''

  try {
    const bounds = getAcademicYearBounds()
    let data;
    if (mode === 'KELAS') {
      data = await absensiService.getRekapKelas(id, bounds.startDate, bounds.endDate)
    } else {
      data = await absensiService.getRekapSiswa(id, bounds.startDate, bounds.endDate)
    }
    dashboardData.value = data
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// --- Computed Data: Filter Dropdown Pencarian ---
const filteredDropdownOptions = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (rekapMode.value === 'KELAS') {
    return daftarKelas.value.filter(k => k.namaKelas.toLowerCase().includes(q))
  } else {
    return daftarSiswa.value.filter(s => s.nama.toLowerCase().includes(q) || s.nisn?.includes(q))
  }
})

// --- Computed Data: Kalkulasi Statistik & Pie Chart ---
const displayStats = computed(() => {
  if (!dashboardData.value) return { hadir: 0, sakit: 0, izin: 0, alfa: 0, dispen: 0 }

  if (timeScope.value === 'OVERALL') {
    return {
      hadir: dashboardData.value.totalHadir || 0,
      sakit: dashboardData.value.totalSakit || 0,
      izin: dashboardData.value.totalIzin || 0,
      alfa: dashboardData.value.totalAlfa || 0,
      dispen: dashboardData.value.totalDispensasi || 0
    }
  } else {
    // Mode MONTHLY: Hitung on the fly berdasarkan bulan kalender
    const targetMonthString = `${calendarYear.value}-${String(calendarMonth.value + 1).padStart(2, '0')}`
    
    // Safely filter records.
    const monthlyRecords = (dashboardData.value.records || []).filter(r => {
      if (!r || !r.tanggal) return false;
      return r.tanggal.startsWith(targetMonthString);
    })
    
    return {
      hadir: monthlyRecords.filter(r => r.status === 'HADIR').length,
      sakit: monthlyRecords.filter(r => r.status === 'SAKIT').length,
      izin: monthlyRecords.filter(r => r.status === 'IZIN').length,
      alfa: monthlyRecords.filter(r => r.status === 'ALPHA').length,
      dispen: monthlyRecords.filter(r => r.status === 'DISPENSASI').length,
    }
  }
})

// Konfigurasi ChartJS
const chartData = computed(() => {
  return {
    labels: ['Hadir', 'Izin', 'Sakit', 'Alfa', 'Dispensasi'],
    datasets: [
      {
        data: [
          displayStats.value.hadir,
          displayStats.value.izin,
          displayStats.value.sakit,
          displayStats.value.alfa,
          displayStats.value.dispen
        ],
        backgroundColor: [
          '#90be6d', // Hadir (Green)
          '#f9c74f', // Izin (Yellow)
          '#f94144', // Sakit (Red)
          '#e5e7eb', // Alfa (Ice Gray)
          '#577590', // Dispensasi (Grey-blue)
        ],
        borderWidth: 0
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    // Konfigurasi Label Persentase
    datalabels: {
      color: (context: any) => {
        // Karena Alfa warnanya Ice Gray sangat terang, kita buat teksnya gelap agar terbaca
        return context.dataIndex === 3 ? '#475569' : '#ffffff';
      },
      font: {
        weight: 'bold' as const,
        size: 16
      },
      formatter: (value: number, context: any) => {
        // Jangan tampilkan tulisan "0%" jika tidak ada data
        if (value === 0) return null;
        
        const dataArr = context.chart.data.datasets[0].data;
        const total = dataArr.reduce((a: number, b: number) => a + b, 0);
        
        const percentage = Math.round((value / total) * 100) + '%';
        return percentage;
      }
    }
  }
}

// Menerima data dari kalender
const handleMonthChange = (val: { month: number, year: number }) => {
  calendarMonth.value = val.month
  calendarYear.value = val.year
}

onMounted(() => {
  fetchDropdownData()
})
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-slate-50 font-inter text-left">
    
    <div class="relative mb-10 z-20">
      <div 
        @click="isDropdownOpen = !isDropdownOpen"
        class="cursor-pointer group inline-block"
      >
        <h1 class="text-4xl font-bold text-[#1A2342] mb-1 flex items-center gap-3">
          {{ dashboardData ? (dashboardData.namaSiswa || dashboardData.namaKelas) : 'Pilih Siswa / Kelas...' }}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-[#26A69A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
          </svg>
        </h1>
        <p class="text-gray-500 flex items-center gap-2">
          {{ rekapMode === 'SISWA' ? 'Mode Siswa' : 'Mode Kelas' }}
          <span v-if="dashboardData?.nisn" class="text-[#26A69A] font-mono font-bold">{{ dashboardData.nisn }}</span>
        </p>
      </div>

      <div v-if="isDropdownOpen" class="absolute top-full left-0 mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div class="flex p-2 bg-slate-50 border-b border-slate-100">
          <button @click="rekapMode = 'SISWA'; searchQuery = ''" :class="['flex-1 py-2 text-xs font-bold rounded-xl transition-all', rekapMode === 'SISWA' ? 'bg-white shadow text-[#1A2342]' : 'text-gray-400 hover:text-gray-600']">Siswa</button>
          <button @click="rekapMode = 'KELAS'; searchQuery = ''" :class="['flex-1 py-2 text-xs font-bold rounded-xl transition-all', rekapMode === 'KELAS' ? 'bg-white shadow text-[#1A2342]' : 'text-gray-400 hover:text-gray-600']">Kelas</button>
        </div>
        <div class="p-4 border-b border-slate-100">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="rekapMode === 'SISWA' ? 'Cari nama atau NISN...' : 'Cari nama kelas...'"
            class="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#26A69A] outline-none font-medium"
          />
        </div>
        <div class="max-h-64 overflow-y-auto p-2 custom-scrollbar">
          <button 
            v-for="item in filteredDropdownOptions" 
            :key="item.id"
            @click="loadDashboardData(item.id, rekapMode)"
            class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors flex flex-col"
          >
            <span class="font-bold text-slate-700">{{ rekapMode === 'SISWA' ? item.nama : item.namaKelas }}</span>
            <span v-if="rekapMode === 'SISWA'" class="text-xs text-[#26A69A] font-mono mt-1">{{ item.nisn }}</span>
          </button>
          <div v-if="filteredDropdownOptions.length === 0" class="p-4 text-center text-gray-400 text-sm">
            Tidak ditemukan.
          </div>
        </div>
      </div>
    </div>

    <div v-if="!dashboardData && !isLoading" class="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center flex flex-col items-center justify-center">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>
      <h3 class="text-lg font-bold text-slate-600 mb-2">Pilih Data Terlebih Dahulu</h3>
      <p class="text-slate-400 text-sm">Klik judul di atas untuk mencari dan memilih Siswa atau Kelas.</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#26A69A]"></div>
    </div>

    <div v-if="dashboardData && !isLoading" class="animate-fade-in space-y-8">
      <div class="flex justify-center">
        <div class="bg-slate-200 p-1 rounded-2xl flex shadow-inner">
          <button 
            @click="timeScope = 'MONTHLY'"
            :class="['px-8 py-3 rounded-xl font-bold text-sm transition-all', timeScope === 'MONTHLY' ? 'bg-[#5A8dee] shadow-md text-white' : 'text-slate-500 hover:text-slate-700']"
          >
            Bulanan ({{ new Date(calendarYear, calendarMonth).toLocaleString('id-ID', { month: 'long' }) }})
          </button>
          <button 
            @click="timeScope = 'OVERALL'"
            :class="['px-8 py-3 rounded-xl font-bold text-sm transition-all', timeScope === 'OVERALL' ? 'bg-[#5A8dee] shadow-md text-white' : 'text-slate-500 hover:text-slate-700']"
          >
            Tahun Ajaran
          </button>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-slate-100 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32">
        
        <div class="relative w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] shrink-0">
           <Pie :data="chartData" :options="chartOptions" />
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-[#90be6d] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-green-100">
              {{ displayStats.hadir }}
            </div>
            <span class="text-3xl font-bold text-[#90be6d]">Hadir</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-[#f9c74f] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-yellow-100">
              {{ displayStats.izin }}
            </div>
            <span class="text-3xl font-bold text-[#f9c74f]">Izin</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-[#f94144] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-red-100">
              {{ displayStats.sakit }}
            </div>
            <span class="text-3xl font-bold text-[#f94144]">Sakit</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-[#e5e7eb] text-slate-600 flex items-center justify-center text-xl font-black shadow-lg shadow-slate-200">
              {{ displayStats.alfa }}
            </div>
            <span class="text-3xl font-bold text-slate-400">Alfa</span>
          </div>
     
        </div>

      </div>

      <StudentAttendanceCalendar 
        :records="dashboardData.records || []" 
        :mode="rekapMode"
        @monthChanged="handleMonthChange"
      />

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>