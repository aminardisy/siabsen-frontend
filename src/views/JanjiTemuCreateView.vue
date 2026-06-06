<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { siswaService } from '@/services/siswaService'
import { guruService } from '@/services/guruService'
import { janjiTemuService } from '@/services/janjiTemuService'
import type { JanjiTemuCreateRequest } from '@/models/janjiTemu'
import type { SiswaResponse } from '@/models/siswa'
import type { GuruResponse } from '@/models/guru'

const router = useRouter()

const siswaOptions = ref<SiswaResponse[]>([])
const guruOptions = ref<GuruResponse[]>([])

const isLoadingOptions = ref(false)
const isSubmitting = ref(false)

// --- Siswa search state ---
const siswaSearch = ref('')
const isSiswaDropdownOpen = ref(false)
const selectedSiswa = ref<SiswaResponse | null>(null)

const filteredSiswa = computed(() => {
  const q = siswaSearch.value.toLowerCase()
  if (!q) return siswaOptions.value
  return siswaOptions.value.filter(
    (s) =>
      s.namaLengkap?.toLowerCase().includes(q) ||
      s.nisn.toLowerCase().includes(q)
  )
})

const selectSiswa = (siswa: SiswaResponse) => {
  selectedSiswa.value = siswa
  formJanjiTemu.value.siswaId = siswa.id
  siswaSearch.value = siswa.namaLengkap || ''
  isSiswaDropdownOpen.value = false
  errors.value.siswaId = ''
}

const clearSiswa = () => {
  selectedSiswa.value = null
  formJanjiTemu.value.siswaId = null
  siswaSearch.value = ''
  isSiswaDropdownOpen.value = false
}

const onSiswaInputFocus = () => {
  isSiswaDropdownOpen.value = true
  if (selectedSiswa.value) siswaSearch.value = ''
}

const onSiswaInputBlur = () => {
  // Delay agar klik item sempat terpanggil dulu
  setTimeout(() => {
    isSiswaDropdownOpen.value = false
    // Kalau blur tanpa pilih, kembalikan teks nama yang terpilih
    if (selectedSiswa.value) {
      siswaSearch.value = selectedSiswa.value.namaLengkap || ''
    } else {
      siswaSearch.value = ''
    }
  }, 150)
}
// -------------------------

const formJanjiTemu = ref<JanjiTemuCreateRequest>({
  siswaId: null,
  guruId: null,
  tanggal: '',
  waktu: '',
  waktuSelesai: '',
  lokasi: '',
  keperluan: '',
})

const errors = ref({
  siswaId: '',
  guruId: '',
  tanggal: '',
  waktu: '',
  waktuSelesai: '',
  lokasi: '',
  keperluan: '',
})

const fetchFormOptions = async () => {
  isLoadingOptions.value = true
  try {
    const [siswaList, guruList] = await Promise.all([siswaService.getAll(), guruService.getAll()])
    siswaOptions.value = siswaList
    guruOptions.value = guruList
  } catch {
    toast.error('Gagal memuat data siswa/guru')
  } finally {
    isLoadingOptions.value = false
  }
}

const validateForm = () => {
  errors.value = {
    siswaId: '',
    guruId: '',
    tanggal: '',
    waktu: '',
    waktuSelesai: '',
    lokasi: '',
    keperluan: '',
  }

  let isValid = true

  if (!formJanjiTemu.value.siswaId) {
    errors.value.siswaId = 'Siswa wajib dipilih'
    isValid = false
  }

  if (!formJanjiTemu.value.guruId) {
    errors.value.guruId = 'Guru wajib dipilih'
    isValid = false
  }

  if (!formJanjiTemu.value.tanggal) {
    errors.value.tanggal = 'Tanggal wajib diisi'
    isValid = false
  }

  if (!formJanjiTemu.value.waktu) {
    errors.value.waktu = 'Waktu mulai wajib diisi'
    isValid = false
  }

  if (!formJanjiTemu.value.waktuSelesai) {
    errors.value.waktuSelesai = 'Waktu selesai wajib diisi'
    isValid = false
  }

  if (!formJanjiTemu.value.lokasi.trim()) {
    errors.value.lokasi = 'Lokasi wajib diisi'
    isValid = false
  }

  if (!formJanjiTemu.value.keperluan.trim()) {
    errors.value.keperluan = 'Keperluan wajib diisi'
    isValid = false
  }

  if (formJanjiTemu.value.waktu && formJanjiTemu.value.waktuSelesai) {
    if (formJanjiTemu.value.waktuSelesai <= formJanjiTemu.value.waktu) {
      errors.value.waktuSelesai = 'Waktu selesai tidak boleh lebih awal atau sama dengan waktu mulai'
      isValid = false
    }
  }

  if (formJanjiTemu.value.tanggal && formJanjiTemu.value.waktu) {
    const selectedDateTime = new Date(`${formJanjiTemu.value.tanggal}T${formJanjiTemu.value.waktu}`)
    if (selectedDateTime < new Date()) {
      errors.value.tanggal = 'Tanggal dan waktu janji temu tidak boleh di masa lalu.'
      errors.value.waktu = 'Tanggal dan waktu janji temu tidak boleh di masa lalu.'
      isValid = false
    }
  }

  return isValid
}

const isFormValid = computed(() => {
  if (!formJanjiTemu.value.siswaId || !formJanjiTemu.value.guruId || !formJanjiTemu.value.tanggal || !formJanjiTemu.value.waktu || !formJanjiTemu.value.waktuSelesai || !formJanjiTemu.value.lokasi.trim() || !formJanjiTemu.value.keperluan.trim()) {
    return false
  }
  if (formJanjiTemu.value.waktuSelesai <= formJanjiTemu.value.waktu) {
    return false
  }
  const selectedDateTime = new Date(`${formJanjiTemu.value.tanggal}T${formJanjiTemu.value.waktu}`)
  return selectedDateTime >= new Date()
})

watch([() => formJanjiTemu.value.tanggal, () => formJanjiTemu.value.waktu], () => {
  if (formJanjiTemu.value.tanggal && formJanjiTemu.value.waktu) {
    const selectedDateTime = new Date(`${formJanjiTemu.value.tanggal}T${formJanjiTemu.value.waktu}`)
    if (selectedDateTime < new Date()) {
      errors.value.tanggal = 'Tanggal dan waktu janji temu tidak boleh di masa lalu.'
      errors.value.waktu = 'Tanggal dan waktu janji temu tidak boleh di masa lalu.'
    } else {
      errors.value.tanggal = ''
      errors.value.waktu = ''
    }
  }
})

const resetForm = () => {
  formJanjiTemu.value = {
    siswaId: null,
    guruId: null,
    tanggal: '',
    waktu: '',
    waktuSelesai: '',
    lokasi: '',
    keperluan: '',
  }
  errors.value = {
    siswaId: '',
    guruId: '',
    tanggal: '',
    waktu: '',
    waktuSelesai: '',
    lokasi: '',
    keperluan: '',
  }
  clearSiswa()
}

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Mohon lengkapi data wajib terlebih dahulu')
    return
  }

  isSubmitting.value = true
  try {
    await janjiTemuService.create({
      siswaId: formJanjiTemu.value.siswaId,
      guruId: formJanjiTemu.value.guruId,
      tanggal: formJanjiTemu.value.tanggal,
      waktu: formJanjiTemu.value.waktu,
      waktuSelesai: formJanjiTemu.value.waktuSelesai,
      lokasi: formJanjiTemu.value.lokasi.trim(),
      keperluan: formJanjiTemu.value.keperluan.trim(),
    })

    toast.success('Janji temu berhasil dibuat')
    resetForm()
    router.push('/janji-temu')
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal membuat janji temu'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchFormOptions)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Buat Janji Temu</h1>
      <p class="text-gray-500">Isi data janji temu antara siswa dan guru/kesiswaan.</p>
    </div>

    <div class="max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div v-if="isLoadingOptions" class="py-8 text-center text-gray-500">Memuat data form...</div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-6">

        <!-- Siswa: Searchable Combobox -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase ml-1">Siswa</label>
          <div class="relative">
            <div class="relative flex items-center">
              <!-- Search icon -->
              <svg class="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                v-model="siswaSearch"
                @focus="onSiswaInputFocus"
                @blur="onSiswaInputBlur"
                :disabled="isSubmitting"
                placeholder="Cari nama atau NISN siswa..."
                class="w-full bg-gray-50 border border-gray-100 pl-9 pr-9 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] disabled:opacity-50"
                :class="{ 'ring-2 ring-[#26A69A]': isSiswaDropdownOpen }"
                autocomplete="off"
              />
              <!-- Clear button -->
              <button
                v-if="selectedSiswa"
                type="button"
                @click="clearSiswa"
                class="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Dropdown hasil pencarian -->
            <div
              v-if="isSiswaDropdownOpen"
              class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto"
            >
              <div v-if="filteredSiswa.length === 0" class="px-4 py-3 text-sm text-gray-400">
                Siswa tidak ditemukan.
              </div>
              <button
                v-for="siswa in filteredSiswa"
                :key="siswa.id"
                type="button"
                @mousedown.prevent="selectSiswa(siswa)"
                class="w-full text-left px-4 py-3 text-sm hover:bg-[#E0F2F1] transition-colors"
                :class="{ 'bg-[#E0F2F1] font-semibold': selectedSiswa?.id === siswa.id }"
              >
                <span class="font-medium text-gray-800">{{ siswa.namaLengkap }}</span>
                <span class="ml-2 text-gray-400 text-xs">{{ siswa.nisn }}</span>
              </button>
            </div>
          </div>
          <p v-if="errors.siswaId" class="text-sm text-red-500">{{ errors.siswaId }}</p>
        </div>

        <!-- Guru: tetap dropdown biasa -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase ml-1">Guru</label>
          <select
            v-model="formJanjiTemu.guruId"
            class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
            :disabled="isSubmitting"
            required
          >
            <option :value="null" disabled>-- Pilih Guru --</option>
            <option v-for="guru in guruOptions" :key="guru.id" :value="guru.id">
              {{ guru.nama }} ({{ guru.nip }})
            </option>
          </select>
          <p v-if="errors.guruId" class="text-sm text-red-500">{{ errors.guruId }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Tanggal</label>
            <input
              type="date"
              v-model="formJanjiTemu.tanggal"
              class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
              :disabled="isSubmitting"
              required
            />
            <p v-if="errors.tanggal" class="text-sm text-red-500">{{ errors.tanggal }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Waktu Mulai</label>
              <input
                type="time"
                v-model="formJanjiTemu.waktu"
                class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
                :disabled="isSubmitting"
                required
              />
              <p v-if="errors.waktu" class="text-sm text-red-500">{{ errors.waktu }}</p>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Waktu Selesai</label>
              <input
                type="time"
                v-model="formJanjiTemu.waktuSelesai"
                class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
                :disabled="isSubmitting"
                required
              />
              <p v-if="errors.waktuSelesai" class="text-sm text-red-500">{{ errors.waktuSelesai }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase ml-1">Lokasi</label>
          <input
            type="text"
            v-model="formJanjiTemu.lokasi"
            class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
            placeholder="Contoh: Ruang Guru"
            :disabled="isSubmitting"
            required
          />
          <p v-if="errors.lokasi" class="text-sm text-red-500">{{ errors.lokasi }}</p>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase ml-1">Keperluan Pertemuan</label>
          <textarea
            v-model="formJanjiTemu.keperluan"
            rows="4"
            class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
            placeholder="Contoh: Konsultasi akademik dan pembinaan siswa"
            :disabled="isSubmitting"
            required
          />
          <p v-if="errors.keperluan" class="text-sm text-red-500">{{ errors.keperluan }}</p>
        </div>

        <div class="flex gap-4 pt-4">
          <button
            type="button"
            @click="router.push('/janji-temu')"
            :disabled="isSubmitting"
            class="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !isFormValid"
            class="flex-1 py-3 bg-[#1A2342] text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Janji Temu' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
