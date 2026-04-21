<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { rekapService } from '@/services/rekapService'
import type { RekapSiswaResponse } from '@/models/rekap'
import { toast } from 'vue-sonner'

const route = useRoute()
const isLoading = ref(true)
const rekap = ref<RekapSiswaResponse | null>(null)

// ── State Filter ──
const activeFilter = ref('SEMESTER') // MINGGU, BULAN, SEMESTER, HARI
const selectedDate = ref(new Date().toISOString().slice(0, 10))

// ── State Kalender ──
const now = new Date()
const bulanKalender = ref(now.getMonth())
const tahunKalender = ref(now.getFullYear())
const hariDipilih = ref(now.getDate())
const hariIni = now.getDate()
const bulanIni = now.getMonth()
const tahunIni = now.getFullYear()
const hariSingkat = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ── Helpers UI ──
const getStatusClass = (status?: string) => {
  if (status === 'PERLU DIPERHATIKAN') return 'bg-orange-50 text-orange-600 border-orange-100'
  if (status === 'BAHAYA') return 'bg-red-50 text-red-600 border-red-100'
  return 'bg-teal-50 text-[#26A69A] border-teal-100'
}

const getTimelineColor = (tipe: string) => {
  const colors: Record<string, string> = {
    'SAKIT': 'border-yellow-400',
    'IZIN': 'border-green-400',
    'ALFA': 'border-red-400',
    'ALPHA': 'border-red-400',
    'TERLAMBAT': 'border-blue-400',
    'DISPENSASI': 'border-purple-400'
  }
  return colors[tipe] || 'border-slate-300'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ── Logic Kalender ──
const namabulan = computed(() =>
  new Date(tahunKalender.value, bulanKalender.value).toLocaleString('id-ID', { month: 'long' })
)

const hariKalender = computed(() => {
  const firstDay = new Date(tahunKalender.value, bulanKalender.value, 1).getDay()
  const jumlahHari = new Date(tahunKalender.value, bulanKalender.value + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= jumlahHari; d++) days.push(d)
  return days
})

const pilihHari = (day: number) => {
  hariDipilih.value = day
  activeFilter.value = 'HARI'
  const d = new Date(tahunKalender.value, bulanKalender.value, day)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  selectedDate.value = d.toISOString().slice(0, 10)
}

const prevMonth = () => {
  if (bulanKalender.value === 0) { bulanKalender.value = 11; tahunKalender.value-- }
  else bulanKalender.value--
}

const nextMonth = () => {
  if (bulanKalender.value === 11) { bulanKalender.value = 0; tahunKalender.value++ }
  else bulanKalender.value++
}

// ── Data Fetching ──
const fetchData = async () => {
  try {
    isLoading.value = true
    const id = route.params.id as string
    const response = await rekapService.getRekapSiswa(id, {
      range: activeFilter.value,
      date: selectedDate.value
    })
    rekap.value = response
  } catch (error) {
    toast.error('Gagal memuat data rekap siswa')
  } finally {
    isLoading.value = false
  }
}

const changeFilter = (filter: string) => {
  activeFilter.value = filter
  fetchData()
}

// Watcher untuk Kalender (Hanya trigger fetch jika mode HARI aktif)
watch(selectedDate, () => {
  if (activeFilter.value === 'HARI') fetchData()
})

onMounted(fetchData)
</script>

<template>
  <div class="p-6 bg-slate-50 min-h-screen font-inter text-left">

    <div v-if="rekap" class="mb-8">
      <nav class="flex text-[10px] text-gray-400 gap-2 mb-1.5 font-bold uppercase tracking-[0.2em]">
        <span>Laporan</span>
        <span>/</span>
        <span class="text-[#26A69A]">{{ rekap.nama }}</span>
      </nav>
      <h1 class="text-2xl font-bold text-[#1A2342]">Rekap Absensi Siswa</h1>
    </div>

    <template v-if="rekap">
      <div class="flex flex-col xl:flex-row gap-6">

        <div class="flex-1 flex flex-col gap-6">

          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex justify-between items-center transition-all">
            <div>
              <h2 class="text-xl font-bold text-[#1A2342]">{{ rekap.nama }}</h2>
              <p class="text-xs text-gray-400 font-mono mt-1">{{ rekap.nisn }} · {{ rekap.kelas }}</p>
            </div>
            <div :class="getStatusClass(rekap.statusKehadiran)" class="px-5 py-2.5 rounded-xl text-[11px] font-bold border uppercase tracking-widest">
              {{ rekap.statusKehadiran }}
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Statistik Kehadiran</label>

              <div class="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  v-for="f in ['MINGGU', 'BULAN', 'SEMESTER']" :key="f"
                  @click="changeFilter(f)"
                  :class="activeFilter === f ? 'bg-white text-[#1A2342] shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                  class="px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider"
                >
                  {{ f }}
                </button>
              </div>
            </div>

            <div
              class="grid grid-cols-2 md:grid-cols-4 gap-4 transition-opacity duration-300"
              :class="isLoading ? 'opacity-40' : 'opacity-100'"
            >
              <div v-for="(val, key) in {Sakit: rekap.jumlahSakit, Izin: rekap.jumlahIzin, Terlambat: rekap.jumlahTerlambat, Alfa: rekap.jumlahAlfa}" :key="key"
                class="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">{{ key }}</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-bold text-[#1A2342]">{{ val }}</span>
                  <span class="text-[9px] text-gray-400 font-bold uppercase">{{ key === 'Terlambat' ? 'Kali' : 'Hari' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 class="font-bold text-[#1A2342] text-sm flex items-center gap-2">
                Riwayat:
                <span class="text-teal-600 uppercase tracking-tighter">
                   {{ activeFilter === 'HARI' ? formatDate(selectedDate) : activeFilter }}
                </span>
              </h2>
              <div v-if="isLoading" class="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div class="overflow-x-auto min-h-[200px]">
              <table class="w-full text-left" :class="isLoading ? 'opacity-40' : 'opacity-100'">
                <thead class="bg-slate-50 text-gray-400">
                  <tr>
                    <th class="px-6 py-3 font-bold uppercase text-[9px] tracking-widest">Tanggal</th>
                    <th class="px-6 py-3 font-bold uppercase text-[9px] tracking-widest">Jenis</th>
                    <th class="px-6 py-3 font-bold uppercase text-[9px] tracking-widest">Keterangan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-if="rekap.riwayat.length === 0">
                    <td colspan="3" class="px-6 py-12 text-center text-gray-300 text-xs italic">Tidak ada catatan untuk periode ini.</td>
                  </tr>
                  <tr v-for="(item, idx) in rekap.riwayat" :key="idx" class="hover:bg-slate-50 transition-colors group">
                    <td class="px-6 py-4 text-[11px] font-medium text-slate-500">{{ formatDate(item.tanggal) }}</td>
                    <td class="px-6 py-4">
                      <span :class="getTimelineColor(item.tipe).replace('border-', 'text-').replace('-400', '-600')" class="text-[10px] font-black uppercase tracking-tighter">
                        {{ item.tipe }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-[11px] text-gray-400 italic">"{{ item.keterangan || '-' }}"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="xl:w-80 flex flex-col gap-6">

          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div class="flex items-center justify-between mb-4 px-1">
              <button @click="prevMonth" class="text-gray-400 hover:text-[#26A69A] text-xl font-bold transition">‹</button>
              <span class="text-[11px] font-black text-[#1A2342] uppercase tracking-[0.2em]">{{ namabulan }} {{ tahunKalender }}</span>
              <button @click="nextMonth" class="text-gray-400 hover:text-[#26A69A] text-xl font-bold transition">›</button>
            </div>

            <div class="grid grid-cols-7 gap-1 text-center">
              <div v-for="h in hariSingkat" :key="h" class="text-[9px] font-bold text-gray-300 py-2 uppercase">{{ h }}</div>
              <div v-for="(day, idx) in hariKalender" :key="idx"
                class="py-2 text-[11px] rounded-xl cursor-pointer transition-all font-bold"
                :class="{
                  'invisible': !day,
                  'bg-[#1A2342] text-white shadow-md': day === hariIni && bulanKalender === bulanIni && tahunKalender === tahunIni,
                  'bg-[#26A69A] text-white shadow-md': day === hariDipilih && activeFilter === 'HARI',
                  'hover:bg-slate-100 text-slate-500': day && (day !== hariDipilih || activeFilter !== 'HARI')
                }"
                @click="day && pilihHari(day)"
              >
                {{ day || '' }}
              </div>
            </div>
          </div>

          <div class="bg-[#1A2342] rounded-2xl p-6 text-white shadow-lg">
             <p class="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Bantuan Navigasi</p>
             <p class="text-xs leading-relaxed opacity-90">
               Klik tanggal pada kalender untuk melihat detail absensi harian secara spesifik.
             </p>
          </div>
        </div>

      </div>
    </template>

    <div v-else-if="!isLoading" class="p-12 text-center text-gray-400">
       Gagal memuat data. Pastikan ID Siswa benar.
    </div>
  </div>
</template>

<style scoped>
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
