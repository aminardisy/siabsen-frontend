<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { reportService, type AttendanceByClassResponse } from '@/services/reportService';
import { useAuthStore } from '@/stores/auth';
import { useNotification } from '@/composables/useNotification';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels);

const router = useRouter();
const authStore = useAuthStore();
const { error } = useNotification();

const allowedRoles = ['GURU', 'KESISWAAN', 'ADMIN'];
const canViewChart = allowedRoles.includes(authStore.getUserRole || '');

const startDate = ref('');
const endDate = ref('');
const gradeLevel = ref<string>('X');
const isLoading = ref(false);
const chartDataRaw = ref<AttendanceByClassResponse[]>([]);
const hasLoaded = ref(false);

const gradeLevelOptions = [
  { label: 'X', value: 'X' },
  { label: 'XI', value: 'XI' },
  { label: 'XII', value: 'XII' }
];

const fetchData = async () => {
  if (startDate.value && endDate.value && new Date(startDate.value) > new Date(endDate.value)) {
    error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
    return;
  }
  
  if ((startDate.value && !endDate.value) || (!startDate.value && endDate.value)) {
    error('Harap isi kedua tanggal atau kosongkan keduanya.');
    return;
  }

  isLoading.value = true;
  chartDataRaw.value = [];
  
  try {
    const params: { start_date?: string; end_date?: string; grade_level?: string } = {};
    if (startDate.value) params.start_date = startDate.value;
    if (endDate.value) params.end_date = endDate.value;
    if (gradeLevel.value) params.grade_level = gradeLevel.value;

    const response = await reportService.getAttendanceByClass(params);
    if (response.success && response.data) {
      chartDataRaw.value = response.data;
    } else {
      error(response.message || 'Gagal mengambil data grafik.');
    }
  } catch (err: any) {
    error(err.response?.data?.message || 'Gagal mengambil data grafik kehadiran kelas.');
  } finally {
    isLoading.value = false;
    hasLoaded.value = true;
  }
};

const handleBarClick = () => {
  const queryParams: Record<string, string> = {};
  if (startDate.value) queryParams.start_date = startDate.value;
  if (endDate.value) queryParams.end_date = endDate.value;
  if (gradeLevel.value) queryParams.grade_level = gradeLevel.value;

  router.push({
    name: 'attendance-stats',
    query: queryParams
  });
};

onMounted(() => {
  if (canViewChart) {
    fetchData(); // Initial load representing the default period Let backend decide
  }
});

const chartData = computed(() => {
  return {
    labels: chartDataRaw.value.map(d => d.className),
    datasets: [
      {
        label: 'Persentase Kehadiran (%)',
        data: chartDataRaw.value.map(d => Math.round(d.attendancePercentage)),
        backgroundColor: '#26A69A',
        borderRadius: 4,
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 20,
      bottom: 10,
      left: 0,
      right: 0
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const index = context.dataIndex;
          const dataPoint = chartDataRaw.value[index];
          if (!dataPoint) {
            return '';
          }
          return [
            `Persentase: ${Math.round(dataPoint.attendancePercentage)}%`,
            `Hadir: ${dataPoint.totalHadir} / ${dataPoint.totalRecord}`
          ];
        }
      }
    },
    datalabels: {
      color: '#ffffff',
      font: {
        weight: 'bold' as const,
        size: 12
      },
      anchor: 'end' as const,
      align: 'top' as const,
      offset: 4,
      formatter: (value: number) => {
        return value + '%';
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20
      },
      title: {
        display: true,
        text: 'Persentase Kehadiran (%)'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Kelas'
      },
      ticks: {
        autoSkipPadding: 40
      }
    }
  },
  onClick: (event: any, elements: any) => {
    if (elements.length > 0) {
      handleBarClick();
    }
  }
};

</script>

<template>
  <div v-if="canViewChart" class="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mt-6">
    <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h3 class="font-bold text-[#1A2342] text-lg">Grafik Kehadiran per Kelas</h3>
        <p class="text-xs text-slate-500 mt-1">Perbandingan persentase kehadiran seluruh kelas</p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
        <select
          v-model="gradeLevel"
          class="w-full sm:w-auto bg-white border border-slate-200 p-2 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm text-gray-700 font-semibold cursor-pointer"
        >
          <option v-for="opt in gradeLevelOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
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
        <p class="text-slate-500 font-medium font-sm">Memuat data grafik...</p>
      </div>
      
      <div v-else-if="hasLoaded && chartDataRaw.length === 0" class="flex flex-col items-center gap-3 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="font-medium">Tidak ada data kehadiran untuk periode ini</p>
      </div>

      <div v-else class="w-full" style="height: 380px; overflow: hidden;">
        <Bar :data="chartData" :options="chartOptions" />
        <p class="text-center text-xs text-slate-400 mt-2 cursor-pointer hover:text-[#26A69A]">
          (Klik pada bar untuk melihat statistik detail)
        </p>
      </div>
    </div>
  </div>
</template>
