<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'
import { siswaService } from '@/services/siswaService'
import { absensiService } from '@/services/absensiService'
import type { SiswaResponse } from '@/models/siswa'

// ── State Data Master ──
const allSiswa = ref<SiswaResponse[]>([])
const selectedSiswa = ref<SiswaResponse | null>(null)
const searchQuery = ref('')
const selectedDate = ref(new Date().toISOString().slice(0, 10))

// ── State Form Keterlambatan ──
const reasonPresets = ['Kesiangan', 'Macet', 'Ban Bocor', 'Masalah Kendaraan']
const form = ref({
  waktuMasuk: '',
  alasanPreset: '',
  alasanLainnya: '',
  tanggal: new Date().toISOString().slice(0, 10)
})
const isSubmitting = ref(false)

// ── State Riwayat & UI ──
const historyHariIni = ref<any[]>([])
const isLoadingRiwayat = ref(false)
const currentTime = ref('')
let clockInterval: any = null

// ── State Kalender (Sinkron dengan Dispensasi) ──
const now = new Date()
const bulanKalender = ref(now.getMonth())
const tahunKalender = ref(now.getFullYear())
const hariIni = now.getDate()
const hariDipilih = ref(now.getDate())
const bulanIni = now.getMonth()
const tahunIni = now.getFullYear()
const hariSingkat = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ── Computed: Search Logic (Identik dengan Dispensasi) ──
const filteredSiswa = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase()
  return allSiswa.value.filter(s =>
    (s.nama?.toLowerCase().includes(q) || s.namaLengkap?.toLowerCase().includes(q) || s.nisn?.includes(q)) &&
    (s.status?.toLowerCase() === 'aktif')
  )
})

const resolvedReason = computed(() => {
  return form.value.alasanLainnya.trim() || form.value.alasanPreset || ''
})

const namabulan = computed(() => new Date(tahunKalender.value, bulanKalender.value).toLocaleString('id-ID', { month: 'long' }))

const hariKalender = computed(() => {
  const firstDay = new Date(tahunKalender.value, bulanKalender.value, 1).getDay()
  const jumlahHari = new Date(tahunKalender.value, bulanKalender.value + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= jumlahHari; d++) days.push(d)
  return days
})

// ── Methods: Fetching ──
const fetchSiswa = async () => {
  try {
    const res = await siswaService.getAll()
    allSiswa.value = Array.isArray(res) ? res : (res as any).data || []
  } catch {
    toast.error('Gagal memuat data siswa')
  }
}

const fetchRiwayatHariIni = async () => {
  isLoadingRiwayat.value = true
  try {
    const response = await absensiService.getRiwayatKeterlambatanHarian(selectedDate.value)
    historyHariIni.value = response.data || []
  } catch {
    historyHariIni.value = []
  } finally {
    isLoadingRiwayat.value = false
  }
}

// ── Methods: Actions ──
const pilihSiswa = (siswa: SiswaResponse) => {
  selectedSiswa.value = siswa
  searchQuery.value = ''
}

const submitForm = async () => {
  if (!selectedSiswa.value) return toast.error('Pilih siswa terlebih dahulu')
  if (!form.value.waktuMasuk) return toast.error('Jam masuk wajib diisi')
  if (!resolvedReason.value) return toast.error('Alasan wajib diisi')

  isSubmitting.value = true
  try {
    await absensiService.catatKeterlambatan({
      siswaId: selectedSiswa.value.id,
      tanggal: form.value.tanggal,
      waktuMasuk: form.value.waktuMasuk,
      alasanTerlambat: resolvedReason.value
    })
    toast.success('Keterlambatan berhasil dicatat')

    // Reset Form
    selectedSiswa.value = null
    form.value.alasanPreset = ''
    form.value.alasanLainnya = ''
    form.value.waktuMasuk = ''

    fetchRiwayatHariIni()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    isSubmitting.value = false
  }
}

const pilihHari = (day: number) => {
  hariDipilih.value = day
  const d = new Date(tahunKalender.value, bulanKalender.value, day)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  selectedDate.value = d.toISOString().slice(0, 10)
  form.value.tanggal = selectedDate.value
}

const prevMonth = () => {
  if (bulanKalender.value === 0) { bulanKalender.value = 11; tahunKalender.value-- }
  else bulanKalender.value--
}

const nextMonth = () => {
  if (bulanKalender.value === 11) { bulanKalender.value = 0; tahunKalender.value++ }
  else bulanKalender.value++
}


// ── Lifecycle ──
onMounted(() => {
  fetchSiswa()
  fetchRiwayatHariIni()

  currentTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  clockInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }, 1000)
})

onBeforeUnmount(() => clearInterval(clockInterval))

watch(selectedDate, () => fetchRiwayatHariIni())
</script>

<template>
  <div class="p-6 bg-slate-50 min-h-screen font-inter">

    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#1A2342]">Pencatatan Keterlambatan</h1>
        <p class="text-sm text-gray-400 mt-1">Input data siswa terlambat harian</p>
      </div>
      <div class="flex items-center gap-6">
        <div class="bg-[#1A2342] text-white px-6 py-2.5 rounded-2xl shadow-lg flex items-center gap-3">
          <span class="text-[10px] font-bold uppercase tracking-widest opacity-60">Realtime</span>
          <span class="text-2xl font-black font-mono leading-none">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col xl:flex-row gap-6">

      <div class="flex-1 flex flex-col gap-6">

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Cari Siswa</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Ketik nama atau NISN siswa..."
              class="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div v-if="searchQuery && filteredSiswa.length > 0" class="mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-white z-20">
            <div
              v-for="siswa in filteredSiswa.slice(0, 5)"
              :key="siswa.id"
              @click="pilihSiswa(siswa)"
              class="flex items-center justify-between px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div>
                <p class="text-sm font-semibold text-[#1A2342]">{{ siswa.nama }}</p>
                <p class="text-xs text-gray-400 font-mono">{{ siswa.nisn }}</p>
              </div>
              <span class="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-medium">{{ siswa.namaKelas }}</span>
            </div>
          </div>

          <div v-if="selectedSiswa" class="mt-3 flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-1">
            <div>
              <p class="text-sm font-bold text-[#1A2342]">{{ selectedSiswa.nama }}</p>
              <p class="text-xs text-gray-500 font-mono">{{ selectedSiswa.nisn }} · {{ selectedSiswa.namaKelas }}</p>
            </div>
            <button @click="selectedSiswa = null" class="text-xs text-red-400 hover:text-red-600 font-bold uppercase tracking-wider">Ganti</button>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Detail Keterlambatan</label>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Jam Masuk <span class="text-red-400">*</span></label>
              <input type="time" v-model="form.waktuMasuk" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal <span class="text-red-400">*</span></label>
              <input type="date" v-model="form.tanggal" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition" />
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-xs font-semibold text-gray-500 mb-2">Pilih Alasan Cepat</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="reason in reasonPresets" :key="reason"
                @click="form.alasanPreset = reason"
                class="px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all"
                :class="form.alasanPreset === reason ? 'border-[#26A69A] bg-teal-50 text-[#26A69A]' : 'border-slate-100 text-slate-400 hover:border-slate-200'"
              >
                {{ reason }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Keterangan Lainnya</label>
            <textarea v-model="form.alasanLainnya" rows="3" placeholder="Misal: Pecah ban di jalan..." class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition resize-none"></textarea>
          </div>

          <div class="flex justify-end mt-6">
            <button
              @click="submitForm"
              :disabled="isSubmitting"
              class="px-10 py-3 bg-[#1A2342] text-white rounded-xl font-bold text-sm hover:bg-[#26A69A] shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Keterlambatan' }}
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 class="font-bold text-[#1A2342]">Riwayat Hari Ini</h2>
            <span class="text-xs text-gray-400">{{ historyHariIni.length }} catatan</span>
          </div>
          <table class="w-full text-left">
            <thead class="bg-[#1A2342] text-white">
              <tr>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Siswa</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Jam</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Alasan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="historyHariIni.length === 0">
                <td colspan="3" class="px-6 py-10 text-center text-gray-400 text-sm">Belum ada catatan keterlambatan untuk hari ini</td>
              </tr>
              <tr v-for="item in historyHariIni" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-6 py-4">
                  <p class="font-semibold text-slate-700 text-sm">{{ item.namaSiswa }}</p>
                  <p class="text-xs text-gray-400 font-mono">{{ item.namaKelas }}</p>
                </td>
                <td class="px-6 py-4 text-center font-mono font-bold text-[#26A69A]">{{ item.waktuMasuk.slice(0, 5) }}</td>
                <td class="px-6 py-4 text-xs text-slate-500 italic">"{{ item.alasanTerlambat }}"</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="xl:w-72 flex flex-col gap-6">

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <button @click="prevMonth" class="text-gray-400 hover:text-[#26A69A] text-lg font-bold transition">‹</button>
            <span class="text-sm font-bold text-[#1A2342]">{{ namabulan }} {{ tahunKalender }}</span>
            <button @click="nextMonth" class="text-gray-400 hover:text-[#26A69A] text-lg font-bold transition">›</button>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center">
            <div v-for="h in hariSingkat" :key="h" class="text-[10px] font-bold text-gray-400 py-1">{{ h }}</div>
            <div v-for="(day, idx) in hariKalender" :key="idx"
              class="py-1.5 text-xs rounded-lg cursor-pointer transition-colors"
              :class="{
                'invisible': !day,
                'bg-[#1A2342] text-white font-bold': day === hariIni && bulanKalender === bulanIni && tahunKalender === tahunIni,
                'bg-[#26A69A] text-white font-bold': day === hariDipilih && !(day === hariIni && bulanKalender === bulanIni && tahunKalender === tahunIni),
                'hover:bg-slate-100 text-slate-600': day && day !== hariIni && day !== hariDipilih
              }"
              @click="day && pilihHari(day)"
            >
              {{ day || '' }}
            </div>
          </div>
        </div>

        <div class="bg-teal-50 border border-teal-200 rounded-2xl p-5">
          <h4 class="text-xs font-bold text-[#26A69A] uppercase tracking-widest mb-2">Info Petugas</h4>
          <p class="text-[11px] text-teal-700 leading-relaxed">
            Data keterlambatan akan otomatis masuk ke rekap absensi harian siswa sebagai status <b>"TERLAMBAT"</b>.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.font-inter { font-family: 'Inter', sans-serif; }
</style>
