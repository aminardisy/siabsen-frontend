<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Ubah Janji Temu</h1>
      <p class="text-gray-500 text-sm">Perbarui jadwal atau keperluan janji temu yang ada.</p>
    </div>

    <div class="max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div v-if="isLoadingData" class="py-8 text-center text-sm font-medium text-gray-400 animate-pulse">
        Memuat data form...
      </div>

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
                :disabled="isSubmitting || isDeleting"
                placeholder="Cari nama atau NISN siswa..."
                class="w-full bg-gray-50 border border-gray-100 pl-9 pr-9 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm font-semibold text-slate-700 disabled:opacity-50"
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
          <p v-if="errors.siswaId" class="text-xs text-red-500 font-bold ml-1 flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ errors.siswaId }}
          </p>
        </div>

        <!-- Guru: tetap dropdown biasa -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase ml-1">Guru</label>
          <select
            v-model="formJanjiTemu.guruId"
            class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm font-semibold text-slate-700 cursor-pointer"
            :disabled="isSubmitting || isDeleting"
            required
          >
            <option :value="null" disabled>-- Pilih Guru --</option>
            <option v-for="guru in guruOptions" :key="guru.id" :value="guru.id">
              {{ guru.nama }} ({{ guru.nip }})
            </option>
          </select>
          <p v-if="errors.guruId" class="text-xs text-red-500 font-bold ml-1 flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ errors.guruId }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="tanggal" class="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Tanggal</label>
            <input
              type="date"
              id="tanggal"
              v-model="formJanjiTemu.tanggal"
              class="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm font-semibold text-slate-700 transition-all"
              :class="{ 'border-red-400 focus:ring-red-100': errors.tanggal }"
            />
            <p v-if="errors.tanggal" class="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 mt-1">
              {{ errors.tanggal }}
            </p>
          </div>

          <div>
            <label for="waktu" class="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Waktu Mulai</label>
            <input
              type="time"
              id="waktu"
              v-model="formJanjiTemu.waktu"
              class="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm font-semibold text-slate-700 transition-all"
              :class="{ 'border-red-400 focus:ring-red-100': errors.waktu }"
            />
            <p v-if="errors.waktu" class="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 mt-1">
              {{ errors.waktu }}
            </p>
          </div>

          <div>
            <label for="waktuSelesai" class="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Waktu Selesai</label>
            <input
              type="time"
              id="waktuSelesai"
              v-model="formJanjiTemu.waktuSelesai"
              class="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm font-semibold text-slate-700 transition-all"
              :class="{ 'border-red-400 focus:ring-red-100': errors.waktuSelesai }"
            />
            <p v-if="errors.waktuSelesai" class="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 mt-1">
              {{ errors.waktuSelesai }}
            </p>
          </div>
        </div>

        <div>
          <label for="lokasi" class="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Lokasi</label>
          <input
            type="text"
            id="lokasi"
            v-model="formJanjiTemu.lokasi"
            placeholder="Contoh: Ruang Guru / Perpustakaan"
            class="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm font-semibold text-slate-700 transition-all"
            :class="{ 'border-red-400 focus:ring-red-100': errors.lokasi }"
          />
          <p v-if="errors.lokasi" class="text-xs text-red-500 font-bold ml-1 flex items-center gap-1 mt-1">
            {{ errors.lokasi }}
          </p>
        </div>

        <div>
          <label for="keperluan" class="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Keperluan Pertemuan</label>
          <textarea
            id="keperluan"
            v-model="formJanjiTemu.keperluan"
            rows="4"
            placeholder="Contoh: Diskusi evaluasi bimbingan akademik"
            class="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] text-sm font-semibold text-slate-700 transition-all resize-none"
            :class="{ 'border-red-400 focus:ring-red-100': errors.keperluan }"
          ></textarea>
          <p v-if="errors.keperluan" class="text-xs text-red-500 font-bold ml-1 flex items-center gap-1 mt-1">
            {{ errors.keperluan }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            @click="isDeleteModalOpen = true"
            :disabled="isSubmitting || isDeleting"
            class="flex-1 py-3 bg-red-50 text-red-500 font-bold hover:bg-red-100 rounded-xl transition-all disabled:opacity-50 text-sm"
          >
            {{ isDeleting ? 'Menghapus...' : 'Hapus Janji Temu' }}
          </button>

          <button
            type="button"
            @click="router.push('/janji-temu')"
            :disabled="isSubmitting || isDeleting"
            class="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 text-sm"
          >
            Batal
          </button>

          <button
            type="submit"
            :disabled="isSubmitting || isDeleting || !isFormValid"
            class="flex-1 py-3 bg-[#1A2342] text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none text-sm active:scale-[0.99]"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>
    </div>

    <ConfirmationModal
      :show="isDeleteModalOpen"
      title="Batalkan Janji Temu"
      message="Apakah Anda yakin ingin membatalkan dan menghapus rekor janji temu sekolah ini? Tindakan ini bersifat permanen."
      confirm-text="Hapus Permanen"
      cancel-text="Kembali"
      variant="danger"
      @close="isDeleteModalOpen = false"
      @confirm="submitDeleteJanjiTemu"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { siswaService } from '@/services/siswaService'
import { guruService } from '@/services/guruService'
import { janjiTemuService } from '@/services/janjiTemuService'
import type { JanjiTemuUpdateRequest } from '@/models/janjiTemu'
import type { SiswaResponse } from '@/models/siswa'
import type { GuruResponse } from '@/models/guru'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'

const router = useRouter()
const route = useRoute()
const janjiTemuId = Number(route.params.id)

const siswaOptions = ref<SiswaResponse[]>([])
const guruOptions = ref<GuruResponse[]>([])

const isLoadingData = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const isDeleteModalOpen = ref(false)

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
  siswaSearch.value = siswa.namaLengkap ?? ''
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
  setTimeout(() => {
    isSiswaDropdownOpen.value = false
    if (selectedSiswa.value) {
      siswaSearch.value = selectedSiswa.value.namaLengkap ?? ''
    } else {
      siswaSearch.value = ''
    }
  }, 150)
}
// -------------------------

const formJanjiTemu = ref<JanjiTemuUpdateRequest>({
  siswaId: null,
  guruId: null,
  tanggal: '',
  waktu: '',
  waktuSelesai: '',
  lokasi: '',
  keperluan: '',
})

const errors = ref({
  siswaId: '', guruId: '', tanggal: '', waktu: '', waktuSelesai: '', lokasi: '', keperluan: '',
})

const fetchData = async () => {
  if (!janjiTemuId) {
    toast.error('ID Janji Temu tidak valid')
    router.push('/janji-temu')
    return
  }

  isLoadingData.value = true
  try {
    const [siswaList, guruList, detailJanjiTemu] = await Promise.all([
      siswaService.getAll(),
      guruService.getAll(),
      janjiTemuService.getById(janjiTemuId),
    ])

    siswaOptions.value = siswaList
    guruOptions.value = guruList

    const siswaId = (detailJanjiTemu.siswa as any)?.id || (detailJanjiTemu as any).siswaId || null

    formJanjiTemu.value = {
      siswaId,
      guruId: (detailJanjiTemu.guru as any)?.id || (detailJanjiTemu as any).guruId || null,
      tanggal: detailJanjiTemu.tanggal || '',
      waktu: detailJanjiTemu.waktu ? detailJanjiTemu.waktu.substring(0, 5) : '',
      waktuSelesai: detailJanjiTemu.waktuSelesai ? detailJanjiTemu.waktuSelesai.substring(0, 5) : '',
      lokasi: detailJanjiTemu.lokasi || '',
      keperluan: detailJanjiTemu.keperluan || '',
    }

    // Populate siswa search bar dengan data yang sudah ada
    if (siswaId) {
      const matched = siswaList.find((s) => s.id === siswaId)
      if (matched) {
        selectedSiswa.value = matched
        siswaSearch.value = matched.namaLengkap || ''
      }
    }

  } catch {
    toast.error('Gagal memuat data form atau menemukan janji temu')
    router.push('/janji-temu')
  } finally {
    isLoadingData.value = false
  }
}

const validateForm = () => {
  errors.value = {
    siswaId: '', guruId: '', tanggal: '', waktu: '', waktuSelesai: '', lokasi: '', keperluan: '',
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
    if (formJanjiTemu.value.waktuSelesai.substring(0, 5) <= formJanjiTemu.value.waktu.substring(0, 5)) {
      errors.value.waktuSelesai = 'Waktu selesai tidak boleh lebih awal atau sama dengan waktu mulai'
      isValid = false
    }
  }

  if (formJanjiTemu.value.tanggal && formJanjiTemu.value.waktu) {
    const selectedDateTime = new Date(`${formJanjiTemu.value.tanggal}T${formJanjiTemu.value.waktu.substring(0, 5)}`)
    if (selectedDateTime < new Date()) {
      errors.value.tanggal = 'Tanggal and waktu janji temu tidak boleh di masa lalu.'
      errors.value.waktu = 'Tanggal and waktu janji temu tidak boleh di masa lalu.'
      isValid = false
    }
  }

  return isValid
}

const isFormValid = computed(() => {
  if (!formJanjiTemu.value.siswaId || !formJanjiTemu.value.guruId || !formJanjiTemu.value.tanggal || !formJanjiTemu.value.waktu || !formJanjiTemu.value.waktuSelesai || !formJanjiTemu.value.lokasi.trim() || !formJanjiTemu.value.keperluan.trim()) {
    return false
  }
  if (formJanjiTemu.value.waktuSelesai.substring(0, 5) <= formJanjiTemu.value.waktu.substring(0, 5)) {
    return false
  }
  const selectedDateTime = new Date(`${formJanjiTemu.value.tanggal}T${formJanjiTemu.value.waktu.substring(0, 5)}`)
  return selectedDateTime >= new Date()
})

watch([() => formJanjiTemu.value.tanggal, () => formJanjiTemu.value.waktu], () => {
  if (formJanjiTemu.value.tanggal && formJanjiTemu.value.waktu) {
    const selectedDateTime = new Date(`${formJanjiTemu.value.tanggal}T${formJanjiTemu.value.waktu.substring(0, 5)}`)
    if (selectedDateTime < new Date()) {
      errors.value.tanggal = 'Tanggal and waktu janji temu tidak boleh di masa lalu.'
      errors.value.waktu = 'Tanggal and waktu janji temu tidak boleh di masa lalu.'
    } else {
      errors.value.tanggal = ''
      errors.value.waktu = ''
    }
  }
})

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Mohon lengkapi data wajib terlebih dahulu')
    return
  }

  isSubmitting.value = true
  try {
    await janjiTemuService.update(janjiTemuId, {
      siswaId: formJanjiTemu.value.siswaId,
      guruId: formJanjiTemu.value.guruId,
      tanggal: formJanjiTemu.value.tanggal,
      waktu: formJanjiTemu.value.waktu.substring(0, 5),
      waktuSelesai: formJanjiTemu.value.waktuSelesai.substring(0, 5),
      lokasi: formJanjiTemu.value.lokasi.trim(),
      keperluan: formJanjiTemu.value.keperluan.trim(),
    })

    toast.success('Janji temu berhasil diperbarui')
    router.push('/janji-temu')
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal mengubah janji temu'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

const submitDeleteJanjiTemu = async () => {
  isDeleteModalOpen.value = false
  isDeleting.value = true
  try {
    await janjiTemuService.delete(janjiTemuId)
    toast.success('Janji temu berhasil dihapus')
    router.push('/janji-temu')
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal menghapus janji temu'
    toast.error(message)
  } finally {
    isDeleting.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
