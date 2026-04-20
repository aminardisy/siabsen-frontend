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

const router = useRouter()
const route = useRoute()
const janjiTemuId = Number(route.params.id)

const siswaOptions = ref<SiswaResponse[]>([])
const guruOptions = ref<GuruResponse[]>([])

const isLoadingData = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)

const formJanjiTemu = ref<JanjiTemuUpdateRequest>({
  siswaId: null,
  guruId: null,
  tanggal: '',
  waktu: '',
  keperluan: '',
})

const errors = ref({
  siswaId: '',
  guruId: '',
  tanggal: '',
  waktu: '',
  keperluan: '',
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

    // Assuming backend returns related `siswa` and `guru` as objects with an `id` field.
    // E.g. siswa: { id: 1, name: 'A' }. We map them to the form.
    // If backend returns `siswaId` directly, adjust `(detailJanjiTemu.siswa as any)?.id` accordingly.
    formJanjiTemu.value = {
      siswaId: (detailJanjiTemu.siswa as any)?.id || (detailJanjiTemu as any).siswaId || null,
      guruId: (detailJanjiTemu.guru as any)?.id || (detailJanjiTemu as any).guruId || null,
      tanggal: detailJanjiTemu.tanggal || '',
      waktu: detailJanjiTemu.waktu || '',
      keperluan: detailJanjiTemu.keperluan || '',
    }

  } catch {
    toast.error('Gagal memuat data form atau menemukan janji temu')
    router.push('/janji-temu') // Redirect jika data ganti gagal/tidak ada agar tidak stuck 404 UI manual
  } finally {
    isLoadingData.value = false
  }
}

const validateForm = () => {
  errors.value = {
    siswaId: '',
    guruId: '',
    tanggal: '',
    waktu: '',
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
    errors.value.waktu = 'Waktu wajib diisi'
    isValid = false
  }

  if (!formJanjiTemu.value.keperluan.trim()) {
    errors.value.keperluan = 'Keperluan wajib diisi'
    isValid = false
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
  if (!formJanjiTemu.value.siswaId || !formJanjiTemu.value.guruId || !formJanjiTemu.value.tanggal || !formJanjiTemu.value.waktu || !formJanjiTemu.value.keperluan.trim()) {
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
      waktu: formJanjiTemu.value.waktu,
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
const handleDelete = async () => {
  if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus janji temu ini?')) return

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

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Ubah Janji Temu</h1>
      <p class="text-gray-500">Perbarui jadwal atau keperluan janji temu yang ada.</p>
    </div>

    <div class="max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div v-if="isLoadingData" class="py-8 text-center text-gray-500">Memuat data form...</div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase ml-1">Siswa</label>
          <select
            v-model="formJanjiTemu.siswaId"
            class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]"
            :disabled="isSubmitting"
            required
          >
            <option :value="null" disabled>-- Pilih Siswa --</option>
            <option v-for="siswa in siswaOptions" :key="siswa.id" :value="siswa.id">
              {{ siswa.namaLengkap }} ({{ siswa.nisn }})
            </option>
          </select>
          <p v-if="errors.siswaId" class="text-sm text-red-500">{{ errors.siswaId }}</p>
        </div>

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
          <div>
            <label for="tanggal" class="block text-sm font-semibold text-gray-700 mb-2">Tanggal <span class="text-red-500">*</span></label>
            <input
              type="date"
              id="tanggal"
              v-model="formJanjiTemu.tanggal"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A2342] focus:border-transparent transition-all mt-1"
              :class="{ 'border-red-500 bg-red-50': errors.tanggal }"
            />
            <p v-if="errors.tanggal" class="text-sm text-red-500">{{ errors.tanggal }}</p>
          </div>

          <div>
            <label for="waktu" class="block text-sm font-semibold text-gray-700 mb-2">Waktu <span class="text-red-500">*</span></label>
            <input
              type="time"
              id="waktu"
              v-model="formJanjiTemu.waktu"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A2342] focus:border-transparent transition-all mt-1"
              :class="{ 'border-red-500 bg-red-50': errors.waktu }"
            />
            <p v-if="errors.waktu" class="text-sm text-red-500">{{ errors.waktu }}</p>
          </div>
        </div>

        <div>
          <label for="keperluan" class="block text-sm font-semibold text-gray-700 mb-2">Keperluan <span class="text-red-500">*</span></label>
          <textarea
            id="keperluan"
            v-model="formJanjiTemu.keperluan"
            rows="4"
            placeholder="Contoh: Diskusi perkembangan akademik"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A2342] focus:border-transparent transition-all mt-1"
            :class="{ 'border-red-500 bg-red-50': errors.keperluan }"
          ></textarea>
          <p v-if="errors.keperluan" class="text-sm text-red-500">{{ errors.keperluan }}</p>
        </div>

        <div class="flex gap-4 pt-4">
          <button
            type="button"
            @click="handleDelete"
            :disabled="isSubmitting || isDeleting"
            class="flex-1 py-3 bg-red-50 text-red-500 font-bold hover:bg-red-100 rounded-xl transition-all disabled:opacity-50"
          >
            {{ isDeleting ? 'Menghapus...' : 'Hapus' }}
          </button>
          <button
            type="button"
            @click="router.push('/janji-temu')"
            :disabled="isSubmitting || isDeleting"
            class="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || isDeleting || !isFormValid"
            class="flex-1 py-3 bg-[#1A2342] text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
