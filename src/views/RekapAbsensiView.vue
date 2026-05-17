<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { absensiService, type RekapDashboardResponse } from '@/services/absensiService'
import { kelasService } from '@/services/kelasService'
import { siswaService } from '@/services/siswaService'
import StudentAttendanceCalendar from '@/components/StudentAttendanceCalendar.vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import ExportLaporan from '@/components/ExportLaporan.vue'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

// --- View State ---
type View = 'kelas-list' | 'kelas-detail' | 'siswa-detail'
const currentView = ref<View>('kelas-list')

// --- Raw Data ---
const daftarKelas = ref<any[]>([])
const daftarSiswa = ref<any[]>([])
const isLoading = ref(false)

// --- Selected Entities ---
const selectedKelas = ref<any | null>(null)
const selectedSiswa = ref<any | null>(null)

// --- Dashboard Data ---
const dashboardData = ref<RekapDashboardResponse | null>(null)

// --- Search ---
const kelasSearch = ref('')
const siswaSearch = ref('')

// --- Daily Detail (Kelas mode) ---
const selectedDailyDate = ref<string | null>(null)
const dailyClassRecords = ref<any[]>([])
const isDailyLoading = ref(false)

// --- Calendar sync ---
const calendarMonth = ref(new Date().getMonth())
const calendarYear = ref(new Date().getFullYear())
const targetCalendarMonth = ref(new Date().getMonth())
const targetCalendarYear = ref(new Date().getFullYear())

// --- Time scope toggle ---
const timeScope = ref<'OVERALL' | 'MONTHLY'>('OVERALL')

// --- Academic Year Filter ---
const currentYearStr = new Date().getFullYear()
const currentMonthIdx = new Date().getMonth()
const defaultStartYear = currentMonthIdx >= 7 ? currentYearStr : currentYearStr - 1

const filterAcademicYear = ref(defaultStartYear)
const filterTerm = ref<'GANJIL' | 'GENAP' | 'FULL'>('FULL')

const academicYearOptions = computed(() => {
  const opts = []
  for (let i = currentYearStr - 2; i <= currentYearStr + 1; i++) {
    opts.push({ value: i, label: `${i}/${i + 1}` })
  }
  return opts
})

const getAcademicYearBounds = () => {
  const y = filterAcademicYear.value
  if (filterTerm.value === 'GANJIL') return { startDate: `${y}-08-01`, endDate: `${y}-12-31` }
  if (filterTerm.value === 'GENAP') return { startDate: `${y + 1}-01-01`, endDate: `${y + 1}-06-30` }
  return { startDate: `${y}-08-01`, endDate: `${y + 1}-06-30` }
}

watch([filterAcademicYear, filterTerm], () => {
  if (filterTerm.value === 'GENAP') {
    targetCalendarMonth.value = 0
    targetCalendarYear.value = filterAcademicYear.value + 1
  } else {
    targetCalendarMonth.value = 7
    targetCalendarYear.value = filterAcademicYear.value
  }
  if (currentView.value === 'kelas-detail' && selectedKelas.value) {
    loadKelasDetail(selectedKelas.value)
  } else if (currentView.value === 'siswa-detail' && selectedSiswa.value) {
    loadSiswaDetail(selectedSiswa.value)
  }
})

// --- Data Fetching ---
const fetchDropdownData = async () => {
  try {
    const [resKelas, resSiswa] = await Promise.all([kelasService.getAll(), siswaService.getAll()])
    daftarKelas.value = resKelas
    daftarSiswa.value = Array.isArray(resSiswa) ? resSiswa : (resSiswa as any).data || []
  } catch (error) {
    console.error('Failed to load data', error)
  }
}

const loadKelasDetail = async (kelas: any) => {
  isLoading.value = true
  selectedKelas.value = kelas
  selectedDailyDate.value = null
  currentView.value = 'kelas-detail'
  timeScope.value = 'OVERALL'
  try {
    const bounds = getAcademicYearBounds()
    dashboardData.value = await absensiService.getRekapKelas(kelas.id, bounds.startDate, bounds.endDate)
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const loadSiswaDetail = async (siswa: any) => {
  isLoading.value = true
  selectedSiswa.value = siswa
  currentView.value = 'siswa-detail'
  timeScope.value = 'OVERALL'
  try {
    const bounds = getAcademicYearBounds()
    dashboardData.value = await absensiService.getRekapSiswa(siswa.id, bounds.startDate, bounds.endDate)
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const goBackToKelasDetail = () => {
  currentView.value = 'kelas-detail'
  selectedSiswa.value = null
  // dashboardData still holds kelas data since we reload below
  if (selectedKelas.value) loadKelasDetail(selectedKelas.value)
}

const goBackToKelasList = () => {
  currentView.value = 'kelas-list'
  dashboardData.value = null
  selectedKelas.value = null
  selectedDailyDate.value = null
}

// --- Daily Detail ---
const handleDayClick = async (dateStr: string) => {
  if (currentView.value !== 'kelas-detail' || !selectedKelas.value) return
  selectedDailyDate.value = dateStr
  isDailyLoading.value = true
  try {
    const records = await absensiService.getDetailKelasHarian(selectedKelas.value.id, dateStr)
    dailyClassRecords.value = records || []
  } catch (error) {
    console.error('Gagal mengambil data harian', error)
    dailyClassRecords.value = []
  } finally {
    isDailyLoading.value = false
  }
}

const closeDailyView = () => {
  selectedDailyDate.value = null
  dailyClassRecords.value = []
}

// --- Filtered Lists ---
const filteredKelas = computed(() => {
  const q = kelasSearch.value.toLowerCase()
  return daftarKelas.value.filter(k => k.namaKelas.toLowerCase().includes(q))
})

const siswaDiKelas = computed(() => {
  if (!selectedKelas.value) return []
  const q = siswaSearch.value.toLowerCase()
  return daftarSiswa.value.filter(s =>
    (s.kelasId === selectedKelas.value.id || s.namaKelas === selectedKelas.value.namaKelas) &&
    (s.nama.toLowerCase().includes(q) || s.nisn?.includes(q))
  )
})

// --- Stats & Chart ---
const displayStats = computed(() => {
  if (!dashboardData.value) return { hadir: 0, sakit: 0, izin: 0, alfa: 0, dispen: 0 }
  if (timeScope.value === 'OVERALL') {
    return {
      hadir: dashboardData.value.totalHadir || 0,
      sakit: dashboardData.value.totalSakit || 0,
      izin: dashboardData.value.totalIzin || 0,
      alfa: dashboardData.value.totalAlfa || 0,
      dispen: dashboardData.value.totalDispensasi || 0,
    }
  }
  const targetMonthString = `${calendarYear.value}-${String(calendarMonth.value + 1).padStart(2, '0')}`
  const monthlyRecords = (dashboardData.value.records || []).filter(r => r?.tanggal?.startsWith(targetMonthString))
  return {
    hadir: monthlyRecords.filter(r => r.status === 'HADIR').length,
    sakit: monthlyRecords.filter(r => r.status === 'SAKIT').length,
    izin: monthlyRecords.filter(r => r.status === 'IZIN').length,
    alfa: monthlyRecords.filter(r => r.status === 'ALPHA').length,
    dispen: monthlyRecords.filter(r => r.status === 'DISPENSASI').length,
  }
})

const chartData = computed(() => ({
  labels: ['Hadir', 'Izin', 'Sakit', 'Alfa', 'Dispensasi'],
  datasets: [{
    data: [displayStats.value.hadir, displayStats.value.izin, displayStats.value.sakit, displayStats.value.alfa, displayStats.value.dispen],
    backgroundColor: ['#90be6d', '#f9c74f', '#f94144', '#e5e7eb', '#577590'],
    borderWidth: 0,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    datalabels: {
      color: (context: any) => context.dataIndex === 3 ? '#475569' : '#ffffff',
      font: { weight: 'bold' as const, size: 16 },
      formatter: (value: number, context: any) => {
        if (value === 0) return null
        const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)
        return Math.round((value / total) * 100) + '%'
      },
    },
  },
}

const handleMonthChange = (val: { month: number; year: number }) => {
  calendarMonth.value = val.month
  calendarYear.value = val.year
}

// --- Helpers ---
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'HADIR': return 'bg-[#90be6d] text-white'
    case 'IZIN': return 'bg-[#f9c74f] text-white'
    case 'SAKIT': return 'bg-[#f94144] text-white'
    case 'DISPENSASI': return 'bg-[#577590] text-white'
    case 'ALPHA': return 'bg-[#e5e7eb] text-slate-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

const formatDateIndo = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(() => { fetchDropdownData() })
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-slate-50 font-inter text-left">

    <!-- ===================== VIEW: KELAS LIST ===================== -->
    <div v-if="currentView === 'kelas-list'" class="animate-fade-in">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-[#1A2342] mb-1">Rekap Absensi</h1>
        <p class="text-slate-400">Pilih kelas untuk melihat rekap absensi</p>
      </div>

      <div class="relative mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="kelasSearch"
          type="text"
          placeholder="Cari nama kelas..."
          class="w-full max-w-md bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#26A69A] shadow-sm"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <button
          v-for="kelas in filteredKelas"
          :key="kelas.id"
          @click="loadKelasDetail(kelas)"
          class="bg-white border border-slate-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-md hover:border-[#26A69A]/30 hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div class="w-10 h-10 rounded-xl bg-[#26A69A]/10 flex items-center justify-center mb-4 group-hover:bg-[#26A69A]/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#26A69A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p class="font-bold text-[#1A2342] text-base">{{ kelas.namaKelas }}</p>
          <p class="text-xs text-slate-400 mt-1">Lihat rekap absensi →</p>
        </button>

        <div v-if="filteredKelas.length === 0" class="col-span-full py-16 text-center text-slate-400">
          Kelas tidak ditemukan.
        </div>
      </div>
    </div>

    <!-- ===================== VIEW: KELAS DETAIL ===================== -->
    <div v-if="currentView === 'kelas-detail'" class="animate-fade-in">

      <!-- Back button -->
      <button @click="goBackToKelasList" class="mb-6 flex items-center gap-2 text-slate-400 hover:text-[#1A2342] font-bold transition-colors text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Semua Kelas
      </button>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-[#1A2342] mb-1">
          {{ selectedKelas?.namaKelas }}
        </h1>

        <p class="text-slate-400">
          Rekap Absensi Kelas
        </p>
      </div>

      <ExportLaporan :defaultClassId="selectedKelas?.id" />

      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#26A69A]"></div>
      </div>

      <div v-if="dashboardData && !isLoading && !selectedDailyDate" class="space-y-8">

        <!-- Academic Filter -->
        <div class="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 w-fit">
          <div class="flex flex-col">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tahun Ajaran</label>
            <select v-model="filterAcademicYear" class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1A2342] outline-none focus:ring-2 focus:ring-[#26A69A] cursor-pointer">
              <option v-for="opt in academicYearOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="flex flex-col">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Semester</label>
            <select v-model="filterTerm" class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1A2342] outline-none focus:ring-2 focus:ring-[#26A69A] cursor-pointer">
              <option value="FULL">Satu Tahun Penuh</option>
              <option value="GANJIL">Ganjil (Ags - Des)</option>
              <option value="GENAP">Genap (Jan - Jun)</option>
            </select>
          </div>
        </div>

        <!-- Time Scope Toggle -->
        <div class="flex justify-center">
          <div class="bg-slate-200 p-1 rounded-2xl flex shadow-inner">
            <button @click="timeScope = 'MONTHLY'" :class="['px-8 py-3 rounded-xl font-bold text-sm transition-all', timeScope === 'MONTHLY' ? 'bg-[#5A8dee] shadow-md text-white' : 'text-slate-500 hover:text-slate-700']">
              Bulanan ({{ new Date(calendarYear, calendarMonth).toLocaleString('id-ID', { month: 'long' }) }})
            </button>
            <button @click="timeScope = 'OVERALL'" :class="['px-8 py-3 rounded-xl font-bold text-sm transition-all', timeScope === 'OVERALL' ? 'bg-[#5A8dee] shadow-md text-white' : 'text-slate-500 hover:text-slate-700']">
              Total Periode
            </button>
          </div>
        </div>

        <!-- Pie Chart + Legend -->
        <div class="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-slate-100 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32">
          <div class="relative w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] shrink-0">
            <Pie :data="chartData" :options="chartOptions" />
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#90be6d] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-green-100">{{ displayStats.hadir }}</div>
              <span class="text-3xl font-bold text-[#90be6d]">Hadir</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#f9c74f] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-yellow-100">{{ displayStats.izin }}</div>
              <span class="text-3xl font-bold text-[#f9c74f]">Izin</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#f94144] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-red-100">{{ displayStats.sakit }}</div>
              <span class="text-3xl font-bold text-[#f94144]">Sakit</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#e5e7eb] text-slate-600 flex items-center justify-center text-xl font-black shadow-lg shadow-slate-200">{{ displayStats.alfa }}</div>
              <span class="text-3xl font-bold text-slate-400">Alfa</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#577590] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-blue-200">{{ displayStats.dispen }}</div>
              <span class="text-3xl font-bold text-[#577590]">Dispensasi</span>
            </div>
          </div>
        </div>

        <!-- Calendar -->
        <StudentAttendanceCalendar
          :records="dashboardData.records || []"
          mode="KELAS"
          :defaultMonth="targetCalendarMonth"
          :defaultYear="targetCalendarYear"
          @monthChanged="handleMonthChange"
          @dayClicked="handleDayClick"
        />

        <!-- Student List -->
        <div class="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 class="text-xl font-bold text-[#1A2342]">Daftar Siswa</h2>
              <p class="text-slate-400 text-sm mt-0.5">{{ siswaDiKelas.length }} siswa di kelas ini</p>
            </div>
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="siswaSearch"
                type="text"
                placeholder="Cari siswa..."
                class="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#26A69A] w-56"
              />
            </div>
          </div>

          <table class="w-full text-left">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Siswa</th>
                <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-if="siswaDiKelas.length === 0">
                <td colspan="2" class="px-8 py-12 text-center text-slate-400 text-sm">Tidak ada siswa ditemukan.</td>
              </tr>
              <tr
                v-for="siswa in siswaDiKelas"
                :key="siswa.id"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <td class="px-8 py-4">
                  <p class="font-bold text-[#1A2342] text-sm">{{ siswa.nama }}</p>
                  <p class="text-xs text-[#26A69A] font-mono mt-0.5">{{ siswa.nisn }}</p>
                </td>
                <td class="px-8 py-4 text-right">
                  <button
                    @click="loadSiswaDetail(siswa)"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2342] hover:bg-[#26A69A] text-white text-xs font-bold rounded-xl transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Lihat Rekap Absensi
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Daily Detail Overlay -->
      <div v-if="selectedDailyDate" class="animate-fade-in">
        <button @click="closeDailyView" class="mb-6 flex items-center gap-2 text-slate-500 hover:text-[#1A2342] font-bold transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Kalender
        </button>

        <div class="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div class="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 class="text-2xl font-bold text-[#1A2342] mb-1">Absensi {{ selectedKelas?.namaKelas }}</h2>
              <p class="text-slate-500 font-medium">{{ formatDateIndo(selectedDailyDate) }}</p>
            </div>
            <div class="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-sm font-bold text-slate-600">
              Total Siswa: {{ dailyClassRecords.length }}
            </div>
          </div>

          <div v-if="isDailyLoading" class="p-20 flex justify-center">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#26A69A]"></div>
          </div>

          <table v-else class="w-full text-left">
            <thead class="bg-white border-b border-slate-100">
              <tr>
                <th class="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Siswa</th>
                <th class="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-if="dailyClassRecords.length === 0">
                <td colspan="2" class="px-8 py-12 text-center text-slate-400 text-sm">Tidak ada catatan absensi untuk tanggal ini.</td>
              </tr>
              <tr v-for="record in dailyClassRecords" :key="record.siswaId" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-8 py-4">
                  <p class="font-bold text-[#1A2342] text-sm">{{ record.siswaNama }}</p>
                  <p class="text-xs text-gray-400 font-mono mt-0.5">{{ record.siswaNisn }}</p>
                </td>
                <td class="px-8 py-4 text-center">
                  <span :class="getStatusBadge(record.status)" class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {{ record.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===================== VIEW: SISWA DETAIL ===================== -->
    <div v-if="currentView === 'siswa-detail'" class="animate-fade-in">

      <!-- Back button -->
      <button @click="goBackToKelasDetail" class="mb-6 flex items-center gap-2 text-slate-400 hover:text-[#1A2342] font-bold transition-colors text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke {{ selectedKelas?.namaKelas }}
      </button>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-[#1A2342] mb-1">{{ dashboardData?.namaSiswa || selectedSiswa?.nama }}</h1>
        <p class="text-slate-400 flex items-center gap-2">
          <span v-if="dashboardData?.nisn" class="text-[#26A69A] font-bold font-mono">{{ dashboardData.nisn }}</span>
          <span v-if="dashboardData?.nisn && dashboardData?.namaKelas" class="text-slate-300">·</span>
          <span v-if="dashboardData?.namaKelas" class="font-medium">{{ dashboardData.namaKelas }}</span>
        </p>
      </div>

      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#26A69A]"></div>
      </div>

      <div v-if="dashboardData && !isLoading" class="space-y-8">

        <!-- Academic Filter -->
        <div class="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 w-fit">
          <div class="flex flex-col">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tahun Ajaran</label>
            <select v-model="filterAcademicYear" class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1A2342] outline-none focus:ring-2 focus:ring-[#26A69A] cursor-pointer">
              <option v-for="opt in academicYearOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="flex flex-col">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Semester</label>
            <select v-model="filterTerm" class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1A2342] outline-none focus:ring-2 focus:ring-[#26A69A] cursor-pointer">
              <option value="FULL">Satu Tahun Penuh</option>
              <option value="GANJIL">Ganjil (Ags - Des)</option>
              <option value="GENAP">Genap (Jan - Jun)</option>
            </select>
          </div>
        </div>

        <!-- Time Scope Toggle -->
        <div class="flex justify-center">
          <div class="bg-slate-200 p-1 rounded-2xl flex shadow-inner">
            <button @click="timeScope = 'MONTHLY'" :class="['px-8 py-3 rounded-xl font-bold text-sm transition-all', timeScope === 'MONTHLY' ? 'bg-[#5A8dee] shadow-md text-white' : 'text-slate-500 hover:text-slate-700']">
              Bulanan ({{ new Date(calendarYear, calendarMonth).toLocaleString('id-ID', { month: 'long' }) }})
            </button>
            <button @click="timeScope = 'OVERALL'" :class="['px-8 py-3 rounded-xl font-bold text-sm transition-all', timeScope === 'OVERALL' ? 'bg-[#5A8dee] shadow-md text-white' : 'text-slate-500 hover:text-slate-700']">
              Total Periode
            </button>
          </div>
        </div>

        <!-- Pie Chart + Legend -->
        <div class="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-slate-100 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32">
          <div class="relative w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] shrink-0">
            <Pie :data="chartData" :options="chartOptions" />
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#90be6d] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-green-100">{{ displayStats.hadir }}</div>
              <span class="text-3xl font-bold text-[#90be6d]">Hadir</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#f9c74f] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-yellow-100">{{ displayStats.izin }}</div>
              <span class="text-3xl font-bold text-[#f9c74f]">Izin</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#f94144] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-red-100">{{ displayStats.sakit }}</div>
              <span class="text-3xl font-bold text-[#f94144]">Sakit</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#e5e7eb] text-slate-600 flex items-center justify-center text-xl font-black shadow-lg shadow-slate-200">{{ displayStats.alfa }}</div>
              <span class="text-3xl font-bold text-slate-400">Alfa</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#577590] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-blue-200">{{ displayStats.dispen }}</div>
              <span class="text-3xl font-bold text-[#577590]">Dispensasi</span>
            </div>
          </div>
        </div>

        <!-- Calendar (siswa mode, no day click) -->
        <StudentAttendanceCalendar
          :records="dashboardData.records || []"
          mode="SISWA"
          :defaultMonth="targetCalendarMonth"
          :defaultYear="targetCalendarYear"
          @monthChanged="handleMonthChange"
        />
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.25s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>