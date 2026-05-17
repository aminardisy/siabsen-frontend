<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { reportService, fetchKelasOptions } from '@/services/reportService';
import { useAuthStore } from '@/stores/auth';
import { useNotification } from '@/composables/useNotification';
import type { KelasResponse } from '@/models/kelas';

const props = defineProps<{
  defaultClassId?: number
}>()

const authStore = useAuthStore();
const { success, error } = useNotification();

const allowedRoles = ['GURU', 'KESISWAAN', 'ADMIN'];
const canExport = allowedRoles.includes(authStore.getUserRole || '');

const startDate = ref('');
const endDate = ref('');
const selectedClass = ref<number | undefined>(props.defaultClassId);
const kelasOptions = ref<KelasResponse[]>([]);
const isLoading = ref(false);

onMounted(async () => {
  if (canExport) {
    kelasOptions.value = await fetchKelasOptions();

    if (props.defaultClassId) {
      selectedClass.value = props.defaultClassId;
    }
  }
});

const handleExport = async () => {
  if (
    startDate.value &&
    endDate.value &&
    new Date(startDate.value) > new Date(endDate.value)
  ) {
    error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
    return;
  }

  isLoading.value = true;

  try {
    const params: {
      format: 'excel';
      start_date?: string;
      end_date?: string;
      class_id?: number;
    } = {
      format: 'excel',
    };

    if (startDate.value) params.start_date = startDate.value;
    if (endDate.value) params.end_date = endDate.value;
    if (selectedClass.value) params.class_id = selectedClass.value;

    const response = await reportService.exportLaporan(params);

    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;

    const contentDisposition = response.headers['content-disposition'];

    let filename = 'laporan-kehadiran.xlsx';

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);

      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    link.setAttribute('download', filename);

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    success('Laporan berhasil diekspor.');
  } catch (err: any) {
    if (err.response && err.response.data) {
      const errorBlob = err.response.data as Blob;

      const reader = new FileReader();

      reader.onload = () => {
        try {
          const errorJson = JSON.parse(reader.result as string);

          error(errorJson.message || 'Gagal mengekspor laporan.');
        } catch (e) {
          error('Gagal mengekspor laporan. Silakan coba lagi.');
        }
      };

      reader.onerror = () => {
        error('Gagal membaca respons error.');
      };

      reader.readAsText(errorBlob);
    } else {
      error('Gagal mengekspor laporan. Silakan coba lagi.');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="canExport" class="p-4 my-4 bg-white rounded-lg shadow">
    <h3 class="text-lg font-semibold mb-4">Export Laporan Kehadiran</h3>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <label for="start-date" class="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
        <input
          type="date"
          id="start-date"
          v-model="startDate"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label for="end-date" class="block text-sm font-medium text-gray-700">Tanggal Akhir</label>
        <input
          type="date"
          id="end-date"
          v-model="endDate"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label for="kelas" class="block text-sm font-medium text-gray-700">Kelas</label>
        <select
          id="kelas"
          v-model="selectedClass"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option :value="undefined">Semua Kelas</option>
          <option v-for="kelas in kelasOptions" :key="kelas.id" :value="kelas.id">
            {{ kelas.namaKelas }}
          </option>
        </select>
      </div>
      <button
        @click="handleExport"
        :disabled="isLoading"
        class="bg-[#1A2342] hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 h-[42px]"
      >
        {{ isLoading ? 'Mengekspor...' : 'Export Excel' }}
      </button>
    </div>
  </div>
</template>
