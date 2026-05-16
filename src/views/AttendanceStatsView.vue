<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { reportService, type AttendanceStatsResponse } from '@/services/reportService';
import { useAuthStore } from '@/stores/auth';
import { useNotification } from '@/composables/useNotification';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { error } = useNotification();

const allowedRoles = ['GURU', 'KESISWAAN'];
const canView = allowedRoles.includes(authStore.getUserRole || '');

const isLoading = ref(false);
const stats = ref<AttendanceStatsResponse | null>(null);
const activeRankingTab = ref<'terlambat' | 'hadir-tertinggi' | 'hadir-terendah' | 'alfa'>('terlambat');

const startDate = computed(() => route.query.start_date as string || '');
const endDate = computed(() => route.query.end_date as string || '');
const gradeLevel = computed(() => route.query.grade_level as string || '');

const gradeLevelDisplay = computed(() => {
  if (!gradeLevel.value) return 'Semua Angkatan';
  return `Angkatan ${gradeLevel.value}`;
});

const periodDisplay = computed(() => {
  if (startDate.value && endDate.value) {
    return `${startDate.value} sd ${endDate.value}`;
  }
  if (startDate.value) return `Mulai ${startDate.value}`;
  if (endDate.value) return `Hingga ${endDate.value}`;
  return 'Seluruh Periode';
});

const fetchStats = async () => {
  isLoading.value = true;
  try {
    const params: { start_date?: string; end_date?: string; grade_level?: string } = {};
    if (startDate.value) params.start_date = startDate.value;
    if (endDate.value) params.end_date = endDate.value;
    if (gradeLevel.value) params.grade_level = gradeLevel.value;

    const response = await reportService.getAttendanceStats(params);
    if (response.success && response.data) {
      stats.value = response.data;
    } else {
      error(response.message || 'Gagal mengambil data statistik.');
    }
  } catch (err: any) {
    error(err.response?.data?.message || 'Gagal mengambil data statistik kehadiran.');
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.push({ name: 'home' });
};

onMounted(() => {
  if (!canView) {
    router.push({ name: 'home' });
    return;
  }
  fetchStats();
});

const StatCard = (props: { label: string; value: string | number; unit?: string }) => ({
  label: props.label,
  value: props.value,
  unit: props.unit
});
</script>

<template>
  <main v-if="canView" class="flex-1 p-3 md:p-4 bg-slate-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-4">
      <!-- Header - Compact -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4">
        <div class="flex-1">
          <h1 class="text-2xl md:text-3xl font-bold text-slate-800">Statistik Kehadiran</h1>
          <div class="flex flex-col md:flex-row gap-1 md:gap-3 mt-1 text-xs md:text-sm text-slate-600">
            <p>{{ gradeLevelDisplay }}</p>
            <p class="hidden md:block">•</p>
            <p>Periode: {{ periodDisplay }}</p>
          </div>
        </div>
        <button
          @click="goBack"
          class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-medium text-sm transition"
        >
          ← Kembali
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-96">
        <div class="flex flex-col items-center gap-3">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26A69A]"></div>
          <p class="text-slate-500 font-medium">Memuat statistik kehadiran...</p>
        </div>
      </div>

      <!-- Error/Empty State -->
      <div v-else-if="!stats" class="flex justify-center items-center h-96">
        <div class="text-center">
          <p class="text-slate-400 text-lg font-medium">Tidak ada data tersedia</p>
        </div>
      </div>

      <!-- Stats Content -->
      <div v-else class="space-y-3 md:space-y-4">
        <!-- Summary Cards - Compact -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
          <div class="bg-white rounded-lg p-2.5 md:p-3 shadow border border-slate-200">
            <p class="text-xs md:text-sm text-slate-500 font-medium truncate">Total Absensi</p>
            <p class="text-lg md:text-2xl font-bold text-[#1A2342] mt-0.5">{{ stats.summary.totalRecord }}</p>
          </div>
          <div class="bg-white rounded-lg p-2.5 md:p-3 shadow border border-slate-200">
            <p class="text-xs md:text-sm text-slate-500 font-medium truncate">Hadir</p>
            <p class="text-lg md:text-2xl font-bold text-green-600 mt-0.5">{{ stats.summary.totalHadir }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ Math.round(stats.summary.attendancePercentage) }}%</p>
          </div>
          <div class="bg-white rounded-lg p-2.5 md:p-3 shadow border border-slate-200">
            <p class="text-xs md:text-sm text-slate-500 font-medium truncate">Terlambat</p>
            <p class="text-lg md:text-2xl font-bold text-amber-600 mt-0.5">{{ stats.summary.totalTerlambat }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ Math.round(stats.summary.latePercentage) }}%</p>
          </div>
          <div class="bg-white rounded-lg p-2.5 md:p-3 shadow border border-slate-200">
            <p class="text-xs md:text-sm text-slate-500 font-medium truncate">Alfa</p>
            <p class="text-lg md:text-2xl font-bold text-red-600 mt-0.5">{{ stats.summary.totalAlpha }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ Math.round(stats.summary.alphaPercentage) }}%</p>
          </div>
          <div class="bg-white rounded-lg p-2.5 md:p-3 shadow border border-slate-200">
            <p class="text-xs md:text-sm text-slate-500 font-medium truncate">Lainnya</p>
            <p class="text-lg md:text-2xl font-bold text-slate-600 mt-0.5">{{ stats.summary.totalSakit + stats.summary.totalIzin + stats.summary.totalDispensasi }}</p>
            <p class="text-xs text-slate-400 mt-0.5">S+I+D</p>
          </div>
        </div>

        <!-- Ringkasan Kehadiran - Compact Horizontal Strip -->
        <div class="bg-white rounded-lg p-3 md:p-4 shadow border border-slate-200">
          <h3 class="text-xs md:text-sm font-bold text-[#1A2342] mb-2">Ringkasan Kehadiran</h3>
          <div class="grid grid-cols-3 md:grid-cols-7 gap-2 md:gap-3 text-center text-xs md:text-sm">
            <div class="flex flex-col items-center gap-0.5">
              <p class="text-slate-500 font-medium">Hadir</p>
              <p class="font-bold text-green-600">{{ stats.summary.totalHadir }}</p>
            </div>
            <div class="flex flex-col items-center gap-0.5">
              <p class="text-slate-500 font-medium">Terlambat</p>
              <p class="font-bold text-amber-600">{{ stats.summary.totalTerlambat }}</p>
            </div>
            <div class="flex flex-col items-center gap-0.5">
              <p class="text-slate-500 font-medium">Sakit</p>
              <p class="font-bold text-blue-600">{{ stats.summary.totalSakit }}</p>
            </div>
            <div class="hidden md:flex flex-col items-center gap-0.5">
              <p class="text-slate-500 font-medium">Izin</p>
              <p class="font-bold text-cyan-600">{{ stats.summary.totalIzin }}</p>
            </div>
            <div class="hidden md:flex flex-col items-center gap-0.5">
              <p class="text-slate-500 font-medium">Alfa</p>
              <p class="font-bold text-red-600">{{ stats.summary.totalAlpha }}</p>
            </div>
            <div class="hidden md:flex flex-col items-center gap-0.5">
              <p class="text-slate-500 font-medium">Dispensasi</p>
              <p class="font-bold text-purple-600">{{ stats.summary.totalDispensasi }}</p>
            </div>
            <div class="hidden md:flex flex-col items-center gap-0.5">
              <p class="text-slate-500 font-medium">Total</p>
              <p class="font-bold text-slate-700">{{ stats.summary.totalRecord }}</p>
            </div>
          </div>
        </div>

        <!-- Ranking Tabs & Table -->
        <div class="bg-white rounded-lg shadow border border-slate-200">
          <!-- Tabs -->
          <div class="flex border-b border-slate-200 bg-slate-50/50">
            <button
              @click="activeRankingTab = 'terlambat'"
              :class="[
                'flex-1 px-3 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition',
                activeRankingTab === 'terlambat'
                  ? 'text-white bg-amber-500 border-b-2 border-amber-600'
                  : 'text-slate-600 hover:text-slate-800'
              ]"
            >
              Terlambat
            </button>
            <button
              @click="activeRankingTab = 'hadir-tertinggi'"
              :class="[
                'flex-1 px-3 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition',
                activeRankingTab === 'hadir-tertinggi'
                  ? 'text-white bg-green-500 border-b-2 border-green-600'
                  : 'text-slate-600 hover:text-slate-800'
              ]"
            >
              Hadir Tertinggi
            </button>
            <button
              @click="activeRankingTab = 'hadir-terendah'"
              :class="[
                'flex-1 px-3 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition',
                activeRankingTab === 'hadir-terendah'
                  ? 'text-white bg-yellow-500 border-b-2 border-yellow-600'
                  : 'text-slate-600 hover:text-slate-800'
              ]"
            >
              Hadir Terendah
            </button>
            <button
              @click="activeRankingTab = 'alfa'"
              :class="[
                'flex-1 px-3 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition',
                activeRankingTab === 'alfa'
                  ? 'text-white bg-red-500 border-b-2 border-red-600'
                  : 'text-slate-600 hover:text-slate-800'
              ]"
            >
              Alfa
            </button>
          </div>

          <!-- Table Content -->
          <div class="p-3 md:p-4">
            <!-- Top Late Classes -->
            <div v-if="activeRankingTab === 'terlambat' && stats.topLateClasses && stats.topLateClasses.length > 0" class="overflow-x-auto">
              <table class="w-full text-xs md:text-sm">
                <thead>
                  <tr class="border-b border-slate-200">
                    <th class="text-left py-2 px-2 font-semibold text-slate-600">No</th>
                    <th class="text-left py-2 px-2 font-semibold text-slate-600">Kelas</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Terlambat</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Persen</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in stats.topLateClasses.slice(0, 5)" :key="item.classId" class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="py-2 px-2">{{ idx + 1 }}</td>
                    <td class="py-2 px-2 font-medium text-[#1A2342]">{{ item.className }}</td>
                    <td class="py-2 px-2 text-center">{{ item.totalTerlambat }}</td>
                    <td class="py-2 px-2 text-center font-bold text-amber-600">{{ Math.round(item.latePercentage || 0) }}%</td>
                    <td class="py-2 px-2 text-center text-slate-500">{{ item.totalRecord }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Highest Attendance Classes -->
            <div v-if="activeRankingTab === 'hadir-tertinggi' && stats.highestAttendanceClasses && stats.highestAttendanceClasses.length > 0" class="overflow-x-auto">
              <table class="w-full text-xs md:text-sm">
                <thead>
                  <tr class="border-b border-slate-200">
                    <th class="text-left py-2 px-2 font-semibold text-slate-600">No</th>
                    <th class="text-left py-2 px-2 font-semibold text-slate-600">Kelas</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Hadir</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Persen</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in stats.highestAttendanceClasses.slice(0, 5)" :key="item.classId" class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="py-2 px-2">{{ idx + 1 }}</td>
                    <td class="py-2 px-2 font-medium text-[#1A2342]">{{ item.className }}</td>
                    <td class="py-2 px-2 text-center">{{ item.totalHadir }}</td>
                    <td class="py-2 px-2 text-center font-bold text-green-600">{{ Math.round(item.attendancePercentage || 0) }}%</td>
                    <td class="py-2 px-2 text-center text-slate-500">{{ item.totalRecord }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Lowest Attendance Classes -->
            <div v-if="activeRankingTab === 'hadir-terendah' && stats.lowestAttendanceClasses && stats.lowestAttendanceClasses.length > 0" class="overflow-x-auto">
              <table class="w-full text-xs md:text-sm">
                <thead>
                  <tr class="border-b border-slate-200">
                    <th class="text-left py-2 px-2 font-semibold text-slate-600">No</th>
                    <th class="text-left py-2 px-2 font-semibold text-slate-600">Kelas</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Hadir</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Persen</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in stats.lowestAttendanceClasses.slice(0, 5)" :key="item.classId" class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="py-2 px-2">{{ idx + 1 }}</td>
                    <td class="py-2 px-2 font-medium text-[#1A2342]">{{ item.className }}</td>
                    <td class="py-2 px-2 text-center">{{ item.totalHadir }}</td>
                    <td class="py-2 px-2 text-center font-bold text-yellow-600">{{ Math.round(item.attendancePercentage || 0) }}%</td>
                    <td class="py-2 px-2 text-center text-slate-500">{{ item.totalRecord }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Highest Alpha Classes -->
            <div v-if="activeRankingTab === 'alfa' && stats.highestAlphaClasses && stats.highestAlphaClasses.length > 0" class="overflow-x-auto">
              <table class="w-full text-xs md:text-sm">
                <thead>
                  <tr class="border-b border-slate-200">
                    <th class="text-left py-2 px-2 font-semibold text-slate-600">No</th>
                    <th class="text-left py-2 px-2 font-semibold text-slate-600">Kelas</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Alfa</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Persen</th>
                    <th class="text-center py-2 px-2 font-semibold text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in stats.highestAlphaClasses.slice(0, 5)" :key="item.classId" class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="py-2 px-2">{{ idx + 1 }}</td>
                    <td class="py-2 px-2 font-medium text-[#1A2342]">{{ item.className }}</td>
                    <td class="py-2 px-2 text-center">{{ item.totalAlpha }}</td>
                    <td class="py-2 px-2 text-center font-bold text-red-600">{{ Math.round(item.alphaPercentage || 0) }}%</td>
                    <td class="py-2 px-2 text-center text-slate-500">{{ item.totalRecord }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State for current tab -->
            <div v-if="
              (activeRankingTab === 'terlambat' && (!stats.topLateClasses || stats.topLateClasses.length === 0)) ||
              (activeRankingTab === 'hadir-tertinggi' && (!stats.highestAttendanceClasses || stats.highestAttendanceClasses.length === 0)) ||
              (activeRankingTab === 'hadir-terendah' && (!stats.lowestAttendanceClasses || stats.lowestAttendanceClasses.length === 0)) ||
              (activeRankingTab === 'alfa' && (!stats.highestAlphaClasses || stats.highestAlphaClasses.length === 0))
            " class="text-center py-6">
              <p class="text-slate-400 text-sm">Tidak ada data untuk tab ini</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
