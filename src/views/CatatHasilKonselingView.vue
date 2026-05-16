<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import * as konselingService from '@/services/konselingService'
import type { KonselingHasilStatusApi, KonselingDetailResponse } from '@/models/konseling'
import {
  mapDbStatusToFormStatus,
  validateCatatHasilForm,
  type CatatHasilFormState,
  type FieldErrors,
} from '@/validation/konselingHasil'

const route = useRoute()
const router = useRouter()

const konselingId = computed(() => Number(route.params.id))

const loading = ref(true)
const submitting = ref(false)
const fieldErrors = ref<FieldErrors>({})
const detail = ref<KonselingDetailResponse | null>(null)

const form = ref<CatatHasilFormState>({
  summary: '',
  recommendation: '',
  status: '',
})

const loadDetail = async () => {
  if (!Number.isFinite(konselingId.value) || konselingId.value < 1) {
    toast.error('ID konseling tidak valid')
    router.push({ name: 'konseling-menunggu-hasil' })
    return
  }
  loading.value = true
  fieldErrors.value = {}
  try {
    const d = await konselingService.getKonselingDetailForKesiswaan(konselingId.value)
    detail.value = d
    form.value.summary = d.summary?.trim() ?? ''
    form.value.recommendation = d.recommendation?.trim() ?? ''
    const mapped = mapDbStatusToFormStatus(d.status)
    form.value.status = mapped || ''
  } catch (e: any) {
    const msg = e.response?.data?.message || 'Gagal memuat data konseling'
    toast.error(msg)
    router.push({ name: 'konseling-menunggu-hasil' })
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  const v = validateCatatHasilForm(form.value)
  if (!v.ok) {
    fieldErrors.value = v.errors
    toast.error('Mohon lengkapi semua field yang wajib diisi')
    return
  }
  fieldErrors.value = {}
  submitting.value = true
  try {
    const payload = {
      summary: form.value.summary.trim(),
      recommendation: form.value.recommendation.trim(),
      status: form.value.status as KonselingHasilStatusApi,
    }
    const res = await konselingService.catatHasilKonseling(konselingId.value, payload)
    toast.success(res.message || 'Hasil konseling berhasil disimpan')
    await loadDetail()
  } catch (e: any) {
    const status = e.response?.status
    const body = e.response?.data
    if (status === 400 && body?.errors) {
      fieldErrors.value = body.errors
    }
    toast.error(body?.message || 'Gagal menyimpan hasil konseling')
  } finally {
    submitting.value = false
  }
}

const cancel = () => {
  router.push({ name: 'konseling-menunggu-hasil' })
}

const getStatusBadgeClass = (status: string) => {
  const s = status?.toUpperCase()
  if (s === 'PENDING') return 'bg-amber-100 text-amber-700'
  if (s === 'SELESAI') return 'bg-emerald-100 text-emerald-700'
  return 'bg-slate-100 text-slate-700'
}

onMounted(loadDetail)
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans pb-20">
    <!-- Header / Navbar-like space -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button 
            @click="cancel"
            class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            title="Kembali"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 class="text-lg font-bold text-slate-800">Catat Hasil Konseling (Kesiswaan)</h1>
        </div>
        <div v-if="detail" class="hidden md:block">
          <span :class="['px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider', getStatusBadgeClass(detail.status)]">
            {{ detail.status }}
          </span>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-slate-200 border-t-[#26A69A] rounded-full animate-spin mb-4"></div>
        <p class="text-slate-500 font-medium">Memuat data konseling...</p>
      </div>

      <template v-else-if="detail">
        <!-- Informasi Siswa & Detail Konseling -->
        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-[#1A2342] px-6 py-4 flex justify-between items-center">
            <h2 class="text-white font-bold flex items-center gap-2">
              <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Detail Konseling
            </h2>
            <div class="md:hidden">
              <span :class="['px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', getStatusBadgeClass(detail.status)]">
                {{ detail.status }}
              </span>
            </div>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nama Siswa</label>
                <p class="text-slate-800 font-semibold">{{ detail.studentName }}</p>
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Topik Konseling</label>
                <p class="text-slate-800 font-semibold">{{ detail.topic }}</p>
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tanggal</label>
                <p class="text-slate-800 font-semibold">{{ detail.date }}</p>
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Jenis Pelanggaran</label>
                <p class="text-slate-800 font-semibold">{{ detail.violationType || '-' }}</p>
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Catatan Awal</label>
                <p class="text-slate-600 text-sm italic">{{ detail.initialNotes || 'Tidak ada catatan awal' }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Form Hasil Konseling -->
        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-[#26A69A] px-6 py-4">
            <h2 class="text-white font-bold flex items-center gap-2">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Hasil & Tindak Lanjut (Kesiswaan)
            </h2>
          </div>
          <form class="p-6 md:p-8 space-y-6" @submit.prevent="submit">
            <div class="space-y-6">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Ringkasan Hasil Konseling <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.summary"
                  rows="5"
                  class="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] border-slate-200 transition-all placeholder:text-slate-300"
                  :class="{ 'border-red-300 bg-red-50': fieldErrors.summary }"
                  placeholder="Ceritakan inti dari pembicaraan konseling..."
                ></textarea>
                <p v-if="fieldErrors.summary" class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                  {{ fieldErrors.summary }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Rekomendasi / Tindak Lanjut <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.recommendation"
                  rows="5"
                  class="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] border-slate-200 transition-all placeholder:text-slate-300"
                  :class="{ 'border-red-300 bg-red-50': fieldErrors.recommendation }"
                  placeholder="Apa langkah selanjutnya yang harus dilakukan siswa atau guru?"
                ></textarea>
                <p v-if="fieldErrors.recommendation" class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                  {{ fieldErrors.recommendation }}
                </p>
              </div>

              <div class="max-w-xs">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Status Konseling <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="form.status"
                    class="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] border-slate-200 bg-white appearance-none transition-all cursor-pointer"
                    :class="{ 'border-red-300 bg-red-50': fieldErrors.status }"
                  >
                    <option disabled value="">Pilih status terbaru</option>
                    <option value="pending">PENDING (Masih dalam proses)</option>
                    <option value="selesai">SELESAI (Sudah tuntas)</option>
                  </select>
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p v-if="fieldErrors.status" class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                  {{ fieldErrors.status }}
                </p>
              </div>
            </div>

            <div class="flex flex-col-reverse sm:flex-row gap-4 pt-8 border-t border-slate-100">
              <button
                type="button"
                class="flex-1 border border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl text-sm hover:bg-slate-50 transition active:scale-[0.98]"
                :disabled="submitting"
                @click="cancel"
              >
                Kembali ke Daftar
              </button>
              <button
                type="submit"
                class="flex-1 bg-[#26A69A] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#1f8c82] transition shadow-md shadow-teal-100 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                :disabled="submitting"
              >
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ submitting ? 'Menyimpan...' : 'Simpan Hasil Konseling' }}</span>
              </button>
            </div>
          </form>
        </section>
      </template>

      <div v-else class="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <p class="text-slate-400">Data konseling tidak ditemukan.</p>
        <button @click="cancel" class="mt-4 text-[#26A69A] font-bold text-sm hover:underline">
          Kembali ke daftar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  resize: vertical;
  min-height: 120px;
}
</style>
