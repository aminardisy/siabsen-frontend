<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { absensiService, type LaporanKeterlambatanResponse } from '@/services/absensiService'

// ATD-11: Date Picker State (Default: Awal bulan ini sampai hari ini)
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
const currentDay = today.toISOString().split('T')[0]

const startDate = ref(firstDay)
const endDate = ref(currentDay)

const laporanData = ref<LaporanKeterlambatanResponse[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

const fetchLaporan = async () => {
  if (!startDate.value || !endDate.value) return

  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // Memanggil endpoint via Service (Lebih bersih & rapi)
    const response = await absensiService.getLaporanKeterlambatan(startDate.value, endDate.value)
    
    // Akses response format ApiResponse standar
    laporanData.value = response.data || []
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Terjadi kesalahan saat memuat laporan.'
    laporanData.value = []
  } finally {
    isLoading.value = false
  }
}

// Pencarian lokal berdasarkan nama siswa
const filteredLaporan = computed(() => {
  if (!searchQuery.value) return laporanData.value
  const query = searchQuery.value.toLowerCase()
  return laporanData.value.filter(item => 
    item.namaSiswa.toLowerCase().includes(query) || 
    (item.nisn && item.nisn.toLowerCase().includes(query))
  )
})

onMounted(() => {
  fetchLaporan()
})
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-slate-50 font-inter text-left">
    
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Laporan Keterlambatan</h1>
      <p class="text-gray-500">Evaluasi tren kedisiplinan siswa berdasarkan periode waktu</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8 flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cari Siswa</label>
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Nama atau NISN..."
          class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm text-slate-700"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Dari Tanggal</label>
        <input 
          type="date" 
          v-model="startDate" 
          class="bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm text-gray-700 font-semibold cursor-pointer"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sampai Tanggal</label>
        <input 
          type="date" 
          v-model="endDate" 
          class="bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm text-gray-700 font-semibold cursor-pointer"
        />
      </div>

      <button 
        @click="fetchLaporan"
        :disabled="isLoading"
        class="bg-[#1A2342] hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 h-[42px]"
      >
        {{ isLoading ? 'Memuat...' : 'Terapkan Filter' }}
      </button>
    </div>

    <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl mb-8 font-medium text-sm flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
      {{ errorMessage }}
    </div>

    <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 class="font-bold text-[#1A2342]">Akumulasi Keterlambatan</h3>
        <span class="text-xs font-bold text-[#26A69A] uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">
          {{ startDate }} sd {{ endDate }}
        </span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-[#1A2342] text-white">
            <tr>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider w-16">No</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">NISN</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Nama Siswa</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Kelas</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Total Terlambat</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="isLoading">
              <td colspan="5" class="px-6 py-12 text-center text-slate-400 font-medium">
                Mengambil data dari server...
              </td>
            </tr>
            <tr v-else-if="filteredLaporan.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-400 font-medium">
                Tidak ada data keterlambatan pada periode ini.
              </td>
            </tr>
            <tr v-else v-for="(item, index) in filteredLaporan" :key="item.siswaId" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4 text-sm text-gray-400 font-mono">{{ index + 1 }}</td>
              <td class="px-6 py-4 text-sm text-gray-500 font-mono">{{ item.nisn || '-' }}</td>
              <td class="px-6 py-4 font-bold text-slate-700">{{ item.namaSiswa }}</td>
              <td class="px-6 py-4 text-sm font-semibold text-slate-600">{{ item.namaKelas }}</td>
              <td class="px-6 py-4 text-center">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-black text-sm border border-red-200">
                  {{ item.totalKeterlambatan }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>