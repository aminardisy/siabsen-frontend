<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Line } from 'vue-chartjs';
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  PointElement, 
  CategoryScale, 
  LinearScale,
  Filler
} from 'chart.js';
import { reportService, type AttendanceTrendData } from '@/services/reportService';
import { useAuthStore } from '@/stores/auth';
import { useNotification } from '@/composables/useNotification';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler);

const authStore = useAuthStore();
const { error } = useNotification();

const canViewChart = authStore.getUserRole === 'KESISWAAN';

const startDate = ref('');
const endDate = ref('');
const groupBy = ref<'weekly' | 'monthly'>('monthly');
const isLoading = ref(false);
const trendDataRaw = ref<AttendanceTrendData[]>([]);
const hasLoaded = ref(false);

const fetchData = async () => {
  if (startDate.value && endDate.value && new Date(startDate.value) > new Date(endDate.value)) {
    error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
    return;
  }

  isLoading.value = true;
  
  try {
    const params: { start_date?: string; end_date?: string; group_by: 'weekly' | 'monthly' } = {
      group_by: groupBy.value
    };
    if (startDate.value) params.start_date = startDate.value;
    if (endDate.value) params.end_date = endDate.value;

    const response = await reportService.getAttendanceTrend(params);
    if (response.success && response.data) {
      trendDataRaw.value = response.data.data;
    } else {
      error(response.message || 'Gagal mengambil data tren kehadiran.');
    }
  } catch (err: any) {
    if (err.response?.status === 403) {
        // Silently fail or show restricted message
    } else {
        error(err.response?.data?.message || 'Gagal mengambil data tren kehadiran.');
    }
  } finally {
    isLoading.value = false;
    hasLoaded.value = true;
  }
};

onMounted(() => {
  if (canViewChart) {
    fetchData();
  }
});

watch(groupBy, () => {
    fetchData();
});

const chartData = computed(() => {
  const labels = trendDataRaw.value.map(d => d.period);
  
  return {
    labels,
    datasets: [
      {
        label: 'Hadir',
        data: trendDataRaw.value.map(d => d.totalHadir),
        borderColor: '#10B981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Sakit',
        data: trendDataRaw.value.map(d => d.totalSakit),
        borderColor: '#3B82F6', // blue-500
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3
      },
      {
        label: 'Izin',
        data: trendDataRaw.value.map(d => d.totalIzin),
        borderColor: '#06B6D4', // cyan-500
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3
      },
      {
        label: 'Alfa',
        data: trendDataRaw.value.map(d => d.totalAlpha),
        borderColor: '#EF4444', // red-500
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: {
            size: 11,
            weight: 'bold' as const
        }
      }
    },
    tooltip: {
      padding: 12,
      backgroundColor: 'rgba(26, 35, 66, 0.9)',
      titleFont: { size: 14, weight: 'bold' as const },
      bodyFont: { size: 13 },
      cornerRadius: 8,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(226, 232, 240, 0.5)'
      },
      title: {
        display: true,
        text: 'Jumlah Siswa'
      }
    },
    x: {
      grid: {
        display: false
      },
      title: {
        display: true,
        text: groupBy.value === 'monthly' ? 'Bulan' : 'Minggu'
      }
    }
  }
};
</script>

<template>
  <div v-if="canViewChart" class="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mt-6">
    <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h3 class="font-bold text-[#1A2342] text-lg">Grafik Tren Kehadiran</h3>
        <p class="text-xs text-slate-500 mt-1">Pola naik/turun kehadiran siswa secara {{ groupBy === 'monthly' ? 'Bulanan' : 'Mingguan' }}</p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
        <select
          v-model="groupBy"
          class="w-full sm:w-auto bg-white border border-slate-200 p-2 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm text-gray-700 font-semibold cursor-pointer"
        >
          <option value="monthly">Bulanan</option>
          <option value="weekly">Mingguan</option>
        </select>
        
        <input 
          type="date" 
          v-model="startDate" 
          class="w-full sm:w-auto bg-white border border-slate-200 p-2 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm text-gray-700 font-semibold cursor-pointer"
        />
        <span class="text-slate-400 font-medium hidden sm:block">sd</span>
        <input 
          type="date" 
          v-model="endDate" 
          class="w-full sm:w-auto bg-white border border-slate-200 p-2 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm text-gray-700 font-semibold cursor-pointer"
        />
        <button 
          @click="fetchData"
          :disabled="isLoading"
          class="w-full sm:w-auto bg-[#1A2342] hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95 h-[40px] flex justify-center items-center"
        >
          {{ isLoading ? 'Memuat...' : 'Terapkan Filter' }}
        </button>
      </div>
    </div>

    <div class="p-6 flex items-center justify-center" style="height: 420px;">
      <div v-if="isLoading" class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#26A69A]"></div>
        <p class="text-slate-500 font-medium font-sm">Memuat data tren...</p>
      </div>
      
      <div v-else-if="hasLoaded && trendDataRaw.length === 0" class="flex flex-col items-center gap-3 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <p class="font-medium">Tidak ada data tren kehadiran pada periode ini</p>
      </div>

      <div v-else class="w-full" style="height: 380px;">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
