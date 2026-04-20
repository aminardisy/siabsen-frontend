<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { siswaService } from '@/services/siswaService'
import { absensiService } from '@/services/absensiService'
import type { SiswaResponse } from '@/models/siswa'

interface FormState {
  tanggal: string
  waktuMasuk: string
  alasanPreset: string
  alasanLainnya: string
}

interface KeterlambatanHistoryItem {
  id: number
  namaSiswa: string
  namaKelas: string
  tanggal: string
  waktuMasuk: string
  alasanTerlambat: string
}

const reasonPresets = ['kesiangan', 'macet']

const siswaList = ref<SiswaResponse[]>([])
const siswaSearch = ref('')
const selectedSiswa = ref<SiswaResponse | null>(null)
const isSubmitting = ref(false)
const isLoadingSiswa = ref(false)
const isLoadingRiwayat = ref(false)
const currentTime = ref('')
const historyHariIni = ref<KeterlambatanHistoryItem[]>([])
let clockInterval: ReturnType<typeof setInterval> | null = null

const getTodayDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatClock = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

const formatTanggalLabel = (tanggal: string) => {
  if (!tanggal) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${tanggal}T00:00:00`))
}

const formatJamLabel = (waktu: string) => {
  if (!waktu) return '-'
  return waktu.slice(0, 5)
}

const getSiswaLabel = (siswa: SiswaResponse) => siswa.namaLengkap ?? siswa.nama
const isSiswaAktif = (siswa: SiswaResponse) => (siswa.status ?? '').toLowerCase() === 'aktif'

const form = ref<FormState>({
  tanggal: getTodayDate(),
  waktuMasuk: '',
  alasanPreset: '',
  alasanLainnya: '',
})

const errors = ref<Record<'siswaId' | 'tanggal' | 'waktuMasuk' | 'alasanTerlambat', string>>({
  siswaId: '',
  tanggal: '',
  waktuMasuk: '',
  alasanTerlambat: '',
})

const filteredSiswa = computed(() => {
  const query = siswaSearch.value.trim().toLowerCase()

  return siswaList.value
    .filter((siswa) => {
      if (!isSiswaAktif(siswa)) return false

      if (!query) return true

      const nama = getSiswaLabel(siswa).toLowerCase()
      return (
        nama.includes(query) ||
        siswa.nisn.toLowerCase().includes(query) ||
        siswa.namaKelas.toLowerCase().includes(query)
      )
    })
    .slice(0, 6)
})

const resolvedReason = computed(() => {
  const alasanLainnya = form.value.alasanLainnya.trim()
  if (alasanLainnya) return alasanLainnya
  return form.value.alasanPreset.trim()
})

const detailPreview = computed(() => ({
  alasan: resolvedReason.value || 'Belum diisi',
  jam: form.value.waktuMasuk ? formatJamLabel(form.value.waktuMasuk) : '--:--',
  tanggal: form.value.tanggal ? formatTanggalLabel(form.value.tanggal) : '-',
}))

const fetchSiswa = async () => {
  isLoadingSiswa.value = true
  try {
    siswaList.value = await siswaService.getAll()
  } catch (_error) {
    toast.error('Gagal memuat data siswa')
  } finally {
    isLoadingSiswa.value = false
  }
}

const clearErrors = () => {
  errors.value = {
    siswaId: '',
    tanggal: '',
    waktuMasuk: '',
    alasanTerlambat: '',
  }
}

const fetchRiwayatHariIni = async () => {
  isLoadingRiwayat.value = true
  try {
    const response = await absensiService.getRiwayatKeterlambatanHarian(getTodayDate())
    historyHariIni.value = (response.data ?? []).map((item) => ({
      id: item.id,
      namaSiswa: item.namaSiswa,
      namaKelas: item.namaKelas ?? '-',
      tanggal: item.tanggal,
      waktuMasuk: item.waktuMasuk,
      alasanTerlambat: item.alasanTerlambat,
    }))
  } catch (_error) {
    historyHariIni.value = []
    toast.error('Gagal memuat riwayat keterlambatan hari ini')
  } finally {
    isLoadingRiwayat.value = false
  }
}

const selectSiswa = (siswa: SiswaResponse) => {
  selectedSiswa.value = siswa
  siswaSearch.value = getSiswaLabel(siswa)
  errors.value.siswaId = ''
}

const onSearchInput = () => {
  selectedSiswa.value = null
  errors.value.siswaId = ''
}

const handlePresetClick = (reason: string) => {
  form.value.alasanPreset = reason
}

const handlePresetDoubleClick = (reason: string) => {
  if (form.value.alasanPreset === reason) {
    form.value.alasanPreset = ''
  }
}

const validateForm = () => {
  clearErrors()

  let isValid = true

  if (!selectedSiswa.value) {
    errors.value.siswaId = 'Siswa wajib dipilih.'
    isValid = false
  } else if (!isSiswaAktif(selectedSiswa.value)) {
    errors.value.siswaId = 'Hanya siswa aktif yang bisa dicatat terlambat.'
    isValid = false
  }

  if (!form.value.tanggal) {
    form.value.tanggal = getTodayDate()
  }

  if (!form.value.waktuMasuk) {
    errors.value.waktuMasuk = 'Jam keterlambatan wajib diisi.'
    isValid = false
  }

  if (!resolvedReason.value) {
    errors.value.alasanTerlambat = 'Alasan keterlambatan wajib diisi.'
    isValid = false
  }

  return isValid
}

const extractServerMessage = (error: any) => {
  const responseData = error?.response?.data

  if (!responseData) {
    return 'Terjadi kesalahan saat menyimpan data.'
  }

  if (responseData.message && typeof responseData.message === 'string') {
    return responseData.message
  }

  return 'Terjadi kesalahan saat menyimpan data.'
}

const submitForm = async () => {
  if (!validateForm()) {
    toast.error('Semua field wajib diisi sebelum submit.')
    return
  }

  isSubmitting.value = true
  try {
    const response = await absensiService.catatKeterlambatan({
      siswaId: selectedSiswa.value!.id,
      tanggal: form.value.tanggal || getTodayDate(),
      waktuMasuk: form.value.waktuMasuk,
      alasanTerlambat: resolvedReason.value,
    })

    const successMessage = response.message && response.message !== 'success'
      ? response.message
      : 'Data keterlambatan berhasil disimpan.'

    toast.success(successMessage)

    await fetchRiwayatHariIni()

    form.value = {
      tanggal: getTodayDate(),
      waktuMasuk: '',
      alasanPreset: '',
      alasanLainnya: '',
    }
    selectedSiswa.value = null
    siswaSearch.value = ''
    clearErrors()
  } catch (error: any) {
    toast.error(extractServerMessage(error))
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchSiswa()
  fetchRiwayatHariIni()

  currentTime.value = formatClock(new Date())
  clockInterval = setInterval(() => {
    currentTime.value = formatClock(new Date())
  }, 1000)
})

onBeforeUnmount(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
  }
})
</script>

<template>
  <div class="min-h-screen w-full bg-[#f4f6f9] px-6 py-7">
    <div class="mx-auto grid w-full gap-6 lg:grid-cols-[1fr_280px]" style="max-width: 1160px">
      <section class="rounded-2xl border border-slate-100 bg-[#f8fafc] px-5 py-6 shadow-sm md:px-8">
        <div class="mx-auto w-full" style="max-width: 620px">
          <div class="relative mb-7">
            <svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="siswaSearch"
              type="text"
              placeholder="Cari siswa..."
              class="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-12 text-lg outline-none transition focus:border-[#26A69A] focus:ring-2 focus:ring-[#26A69A]/20"
              @input="onSearchInput"
            />
            <button
              v-if="siswaSearch"
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              @click="siswaSearch = ''"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p v-if="errors.siswaId" class="mb-2 text-sm text-red-500">{{ errors.siswaId }}</p>

          <div class="mb-5 text-center text-[72px] font-bold leading-none text-[#111d39]">
            {{ currentTime }}
          </div>

          <div class="mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
              v-for="siswa in filteredSiswa"
              :key="siswa.id"
              type="button"
              class="grid w-full grid-cols-[1.2fr_1fr_0.9fr] items-center gap-2 border-b border-slate-100 px-4 py-3 text-left last:border-b-0"
              :class="selectedSiswa?.id === siswa.id ? 'bg-[#eef6ff]' : 'hover:bg-slate-50'"
              @click="selectSiswa(siswa)"
            >
              <span class="text-sm font-semibold text-slate-500">{{ siswa.nisn }}</span>
              <span class="text-sm font-semibold text-slate-700">{{ getSiswaLabel(siswa) }}</span>
              <span class="text-right text-sm font-semibold text-slate-500">{{ siswa.namaKelas }}</span>
            </button>

            <div v-if="isLoadingSiswa" class="px-4 py-6 text-center text-sm text-slate-500">Memuat data siswa...</div>
            <div v-else-if="filteredSiswa.length === 0" class="px-4 py-6 text-center text-sm text-slate-500">Siswa tidak ditemukan.</div>
          </div>

          <div class="mb-9 flex items-center justify-between px-2 text-lg text-slate-500">
            <span>&larr; Previous</span>
            <span>Next &rarr;</span>
          </div>

            <form class="rounded-xl border border-slate-200 bg-white p-6" @submit.prevent="submitForm">
              <h2 class="mb-4 text-lg font-bold text-[#1A2342]">Alasan Telat</h2>

            <div class="mb-4 grid grid-cols-2 gap-3">
              <button
                v-for="reason in reasonPresets"
                :key="reason"
                type="button"
                  class="rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition"
                :class="form.alasanPreset === reason ? 'border-[#1A2342] bg-[#1A2342] text-white' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  @click="handlePresetClick(reason)"
                  @dblclick="handlePresetDoubleClick(reason)"
              >
                {{ reason }}
              </button>
            </div>

            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-slate-700">Lainnya</label>
              <textarea
                v-model="form.alasanLainnya"
                rows="3"
                class="w-full rounded-xl border border-slate-200 bg-[#fbfcff] px-4 py-3 text-sm outline-none transition focus:border-[#26A69A]"
              />
              <p v-if="errors.alasanTerlambat" class="mt-1 text-sm text-red-500">{{ errors.alasanTerlambat }}</p>
            </div>

            <div class="mb-5 rounded-xl border border-[#dbe7ff] bg-gradient-to-br from-[#f8fbff] to-[#eef5ff] p-4">
              <p class="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Detail Keterlambatan</p>
              <div class="grid gap-3 md:grid-cols-3">
                <div class="rounded-lg border border-white/60 bg-white/90 p-3 shadow-sm">
                  <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Alasan</p>
                  <p class="mt-1 text-sm font-semibold text-slate-700">{{ detailPreview.alasan }}</p>
                </div>
                <div class="rounded-lg border border-white/60 bg-white/90 p-3 shadow-sm">
                  <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Jam</p>
                  <p class="mt-1 text-sm font-semibold text-slate-700">{{ detailPreview.jam }}</p>
                </div>
                <div class="rounded-lg border border-white/60 bg-white/90 p-3 shadow-sm">
                  <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Tanggal</p>
                  <p class="mt-1 text-sm font-semibold text-slate-700">{{ detailPreview.tanggal }}</p>
                </div>
              </div>
            </div>

            <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-semibold text-slate-600">Tanggal</label>
                <input
                  v-model="form.tanggal"
                  type="date"
                  class="w-full rounded-xl border border-slate-200 bg-[#fbfcff] px-4 py-3 text-sm outline-none transition focus:border-[#26A69A]"
                />
                <p v-if="errors.tanggal" class="mt-1 text-sm text-red-500">{{ errors.tanggal }}</p>
              </div>

              <div>
                <label class="mb-1 block text-sm font-semibold text-slate-600">Jam Keterlambatan</label>
                <input
                  v-model="form.waktuMasuk"
                  type="time"
                  class="w-full rounded-xl border border-slate-200 bg-[#fbfcff] px-4 py-3 text-sm outline-none transition focus:border-[#26A69A]"
                />
                <p v-if="errors.waktuMasuk" class="mt-1 text-sm text-red-500">{{ errors.waktuMasuk }}</p>
              </div>
            </div>

            <div class="flex justify-center pt-1">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="rounded-xl bg-[#1A2342] px-16 py-3 text-2xl font-bold text-white shadow-md transition hover:bg-[#24355f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </section>

      <aside class="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
        <h3 class="mb-4 text-2xl font-bold text-[#1A2342]">Riwayat Hari Ini</h3>

        <div class="space-y-3">
          <p v-if="isLoadingRiwayat" class="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
            Memuat riwayat hari ini...
          </p>

          <article
            v-for="item in historyHariIni"
            :key="item.id"
            class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#c9d9f8] hover:shadow"
          >
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-bold text-[#1A2342]">{{ item.namaSiswa }}</p>
                  <p class="text-xs text-slate-500">{{ item.namaKelas }}</p>
                </div>
                <span class="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-bold text-[#1A4FA3]">Terlambat</span>
              </div>

              <div class="grid gap-2 sm:grid-cols-2">
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Jam</p>
                  <p class="text-sm font-semibold text-slate-700">{{ formatJamLabel(item.waktuMasuk) }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Tanggal</p>
                  <p class="text-sm font-semibold text-slate-700">{{ formatTanggalLabel(item.tanggal) }}</p>
                </div>
              </div>

              <div class="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Alasan</p>
                <p class="text-sm text-slate-700">{{ item.alasanTerlambat }}</p>
              </div>
            </div>
          </article>

          <p v-if="!isLoadingRiwayat && historyHariIni.length === 0" class="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
            Belum ada catatan keterlambatan hari ini.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
