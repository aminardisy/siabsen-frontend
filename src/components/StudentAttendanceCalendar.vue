<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface AttendanceRecord {
  tanggal: string;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPHA' | 'DISPENSASI';
  dokumenUrl?: string;
}

const props = defineProps<{
  records: AttendanceRecord[],
  mode: 'SISWA' | 'KELAS'
}>()

const emit = defineEmits(['monthChanged'])

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

watch([currentMonth, currentYear], () => {
  emit('monthChanged', { month: currentMonth.value, year: currentYear.value })
}, { immediate: true })

const namaBulan = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleString('id-ID', { month: 'long' })
})

const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

// Data Grouping Logic
const calendarDays = computed(() => {
  const days = []
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()

  // Prev Month Padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({ date: daysInPrevMonth - i, isCurrentMonth: false, siswaData: null, kelasData: null })
  }

  // Current Month
  for (let i = 1; i <= daysInMonth; i++) {
    const monthStr = String(currentMonth.value + 1).padStart(2, '0')
    const dayStr = String(i).padStart(2, '0')
    const dateString = `${currentYear.value}-${monthStr}-${dayStr}`
    
    // Ambil SEMUA record untuk tanggal ini
    const dayRecords = props.records.filter(r => r.tanggal && r.tanggal.startsWith(dateString))
    
    let siswaData = null;
    let kelasData = null;

    if (props.mode === 'SISWA' && dayRecords.length > 0) {
      // Siswa hanya punya 1 record per hari
      siswaData = dayRecords[0]
    } else if (props.mode === 'KELAS' && dayRecords.length > 0) {
      // Kelas punya banyak record per hari, kita agregasi
      kelasData = {
        hadir: dayRecords.filter(r => r.status === 'HADIR').length,
        izin: dayRecords.filter(r => r.status === 'IZIN').length,
        sakit: dayRecords.filter(r => r.status === 'SAKIT').length,
        alfa: dayRecords.filter(r => r.status === 'ALPHA').length,
      }
    }

    // Masukkan ke array dengan properti terpisah agar TypeScript bahagia
    days.push({ date: i, isCurrentMonth: true, fullDate: dateString, siswaData, kelasData })
  }

  // Next Month Padding
  const totalCells = Math.ceil(days.length / 7) * 7
  const remainingCells = totalCells - days.length
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ date: i, isCurrentMonth: false, siswaData: null, kelasData: null })
  }

  return days
})

const prevMonth = () => {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } 
  else { currentMonth.value-- }
}

const nextMonth = () => {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } 
  else { currentMonth.value++ }
}

// Styling Helper untuk Mode SISWA (Full Block) dengan Palette Baru
const getSiswaBgClass = (status: string | undefined) => {
  switch (status) {
    case 'HADIR': return 'bg-[#90be6d] text-white shadow-md'
    case 'SAKIT': return 'bg-[#f94144] text-white shadow-md'
    case 'IZIN': return 'bg-[#f9c74f] text-white shadow-md'
    case 'ALPHA': return 'bg-[#e5e7eb] text-slate-600 shadow-md'   // Ice Gray swapped
    case 'DISPENSASI': return 'bg-[#577590] text-white shadow-md' // Grey Blue swapped
    default: return 'bg-transparent border border-slate-100 text-slate-400'
  }
}
</script>

<template>
  <div class="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-left mt-8">
    
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-slate-100 bg-white gap-4">
      <h3 class="text-lg font-bold text-[#1A2342] flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#26A69A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Detail Kehadiran
      </h3>
      
      <div class="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full md:w-auto justify-between">
        <button @click="prevMonth" class="text-slate-400 hover:text-[#1A2342] transition-colors p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <span class="font-bold text-[#1A2342] min-w-[120px] text-center">{{ namaBulan }} {{ currentYear }}</span>
        <button @click="nextMonth" class="text-slate-400 hover:text-[#1A2342] transition-colors p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>

    <div class="p-4 md:p-8 overflow-x-auto custom-scrollbar">
      <div class="min-w-[800px]">
        <div class="grid grid-cols-7 gap-4 mb-4">
          <div v-for="day in daysOfWeek" :key="day" class="text-center font-black text-xs text-slate-300 uppercase tracking-widest">
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-3 md:gap-4">
          <div 
            v-for="(cell, index) in calendarDays" 
            :key="index"
            class="h-36 md:h-44 rounded-2xl transition-all duration-200 relative group"
            :class="!cell.isCurrentMonth ? 'opacity-30' : ''"
          >
            
            <div 
              v-if="mode === 'SISWA'" 
              class="w-full h-full flex flex-col items-center justify-center rounded-2xl p-2 transition-transform hover:scale-105"
              :class="getSiswaBgClass(cell.siswaData?.status)"
            >
              <span :class="['font-bold', cell.siswaData ? 'text-xs md:text-sm opacity-80' : 'text-xl md:text-2xl']">
                {{ cell.date }}
              </span>
              <span v-if="cell.siswaData" class="font-black tracking-widest uppercase text-[10px] md:text-sm mt-2 drop-shadow-sm text-center">
                {{ cell.siswaData.status }}
              </span>
            </div>

            <div 
              v-else-if="mode === 'KELAS'" 
              class="w-full h-full flex flex-col p-3 md:p-4 rounded-2xl border-2 border-slate-50 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <span class="font-black text-slate-300 text-sm md:text-xl leading-none mb-3">{{ cell.date }}</span>
              
              <div v-if="cell.kelasData" class="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto">
                <div v-if="cell.kelasData.hadir > 0" class="flex items-center gap-1.5" title="Hadir">
                  <div class="shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#90be6d] text-white flex items-center justify-center text-[10px] md:text-xs font-black shadow-sm">
                    {{ cell.kelasData.hadir }}
                  </div>
                  <span class="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Hadir</span>
                </div>
                <div v-if="cell.kelasData.izin > 0" class="flex items-center gap-1.5" title="Izin">
                  <div class="shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#f9c74f] text-white flex items-center justify-center text-[10px] md:text-xs font-black shadow-sm">
                    {{ cell.kelasData.izin }}
                  </div>
                  <span class="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Izin</span>
                </div>
                <div v-if="cell.kelasData.sakit > 0" class="flex items-center gap-1.5" title="Sakit">
                  <div class="shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#f94144] text-white flex items-center justify-center text-[10px] md:text-xs font-black shadow-sm">
                    {{ cell.kelasData.sakit }}
                  </div>
                  <span class="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Sakit</span>
                </div>
                <div v-if="cell.kelasData.alfa > 0" class="flex items-center gap-1.5" title="Alfa">
                  <div class="shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#e5e7eb] text-slate-600 flex items-center justify-center text-[10px] md:text-xs font-black shadow-sm">
                    {{ cell.kelasData.alfa }}
                  </div>
                  <span class="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Alfa</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>