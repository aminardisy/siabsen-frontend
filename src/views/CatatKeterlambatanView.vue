<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { siswaService } from '@/services/siswaService'
import { absensiService } from '@/services/absensiService'
import type { SiswaResponse } from '@/models/siswa'

interface FormState {
  tanggal: string
  waktuMasuk: string
  alasanTerlambat: string
  catatan: string
}

const siswaList = ref<SiswaResponse[]>([])
const siswaSearch = ref('')
const selectedSiswaId = ref<number | null>(null)
const isSubmitting = ref(false)
const showOptions = ref(false)

const getTodayDate = () => {
  const datePart = new Date().toISOString().split('T')[0]
  return datePart ?? ''
}

const form = ref<FormState>({
  tanggal: getTodayDate(),
  waktuMasuk: '',
  alasanTerlambat: '',
  catatan: ''
})

const errors = ref<Record<string, string>>({})

const siswaAktif = computed(() => siswaList.value.filter((s) => s.status === 'Aktif'))

const filteredSiswa = computed(() => {
  const query = siswaSearch.value.trim().toLowerCase()

  if (!query) {
    return siswaAktif.value.slice(0, 8)
  }

  return siswaAktif.value
    .filter((s) => {
      return (
        s.namaLengkap.toLowerCase().includes(query) ||
        s.nisn.includes(query) ||
        s.namaKelas.toLowerCase().includes(query)
      )
    })
    .slice(0, 8)
})

const fetchSiswa = async () => {
  try {
    siswaList.value = await siswaService.getAll()
  } catch (_error) {
    toast.error('Gagal memuat data siswa')
  }
}

const chooseSiswa = (siswa: SiswaResponse) => {
  selectedSiswaId.value = siswa.id
  siswaSearch.value = `${siswa.namaLengkap} (${siswa.nisn})`
  showOptions.value = false
  delete errors.value.siswaId
}

const validateForm = () => {
  const validationErrors: Record<string, string> = {}

  if (!selectedSiswaId.value) validationErrors.siswaId = 'Siswa wajib dipilih.'
  if (!form.value.tanggal) validationErrors.tanggal = 'Tanggal wajib diisi.'
  if (!form.value.waktuMasuk) validationErrors.waktuMasuk = 'Jam keterlambatan wajib diisi.'
  if (!form.value.alasanTerlambat.trim()) validationErrors.alasanTerlambat = 'Alasan keterlambatan wajib diisi.'

  errors.value = validationErrors

  return Object.keys(validationErrors).length === 0
}

const submitForm = async () => {
  if (!validateForm()) {
    toast.error('Semua field wajib diisi sebelum submit.')
    return
  }

  isSubmitting.value = true
  try {
    const response = await absensiService.catatKeterlambatan({
      siswaId: selectedSiswaId.value as number,
      tanggal: form.value.tanggal,
      waktuMasuk: form.value.waktuMasuk,
      alasanTerlambat: form.value.alasanTerlambat.trim(),
      catatan: form.value.catatan.trim() || undefined
    })

    toast.success(response.message || 'Data keterlambatan berhasil disimpan.')

    form.value = {
      tanggal: getTodayDate(),
      waktuMasuk: '',
      alasanTerlambat: '',
      catatan: ''
    }
    selectedSiswaId.value = null
    siswaSearch.value = ''
    errors.value = {}
  } catch (error: any) {
    const serverMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.'
    toast.error(serverMessage)
  } finally {
    isSubmitting.value = false
  }
}

const onSiswaInput = () => {
  selectedSiswaId.value = null
  showOptions.value = true
}

onMounted(fetchSiswa)
</script>

<template>
  <div class="w-full min-h-screen bg-gray-50 p-8 font-inter">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Catat Keterlambatan</h1>
      <p class="text-gray-500">Pencatatan keterlambatan siswa oleh wali kelas dan petugas piket.</p>
    </div>

    <div class="bg-white border border-gray-100 rounded-2xl shadow-sm max-w-3xl p-6 md:p-8">
      <form @submit.prevent="submitForm" class="space-y-5">
        <div class="space-y-1 relative">
          <label class="text-xs font-bold text-gray-400 uppercase">Siswa</label>
          <input
            v-model="siswaSearch"
            type="text"
            placeholder="Cari nama siswa / NISN / kelas"
            class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
            @focus="showOptions = true"
            @input="onSiswaInput"
            required
          />
          <p v-if="errors.siswaId" class="text-xs text-red-500">{{ errors.siswaId }}</p>

          <div
            v-if="showOptions"
            class="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto"
          >
            <button
              v-for="s in filteredSiswa"
              :key="s.id"
              type="button"
              class="w-full text-left px-4 py-2 hover:bg-teal-50 transition-colors"
              @click="chooseSiswa(s)"
            >
              <p class="text-sm font-semibold text-slate-700">{{ s.namaLengkap }}</p>
              <p class="text-xs text-gray-500">NISN: {{ s.nisn }} • Kelas: {{ s.namaKelas }}</p>
            </button>
            <p v-if="filteredSiswa.length === 0" class="px-4 py-3 text-sm text-gray-500">Siswa tidak ditemukan.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase">Tanggal</label>
            <input
              v-model="form.tanggal"
              type="date"
              class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
              required
            />
            <p v-if="errors.tanggal" class="text-xs text-red-500">{{ errors.tanggal }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase">Jam Keterlambatan</label>
            <input
              v-model="form.waktuMasuk"
              type="time"
              class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
              required
            />
            <p v-if="errors.waktuMasuk" class="text-xs text-red-500">{{ errors.waktuMasuk }}</p>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase">Alasan Keterlambatan</label>
          <textarea
            v-model="form.alasanTerlambat"
            rows="3"
            placeholder="Contoh: Ban bocor, transportasi terlambat"
            class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
            required
          />
          <p v-if="errors.alasanTerlambat" class="text-xs text-red-500">{{ errors.alasanTerlambat }}</p>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase">Catatan Tambahan</label>
          <textarea
            v-model="form.catatan"
            rows="2"
            placeholder="Opsional"
            class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
          />
        </div>

        <div class="pt-2 flex justify-end">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="bg-[#1A2342] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan / Submit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
