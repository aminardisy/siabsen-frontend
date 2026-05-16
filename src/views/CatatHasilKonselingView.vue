<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { konselingService } from '@/services/konselingService'
import type { KonselingHasilStatusApi } from '@/models/konseling'
import {
  mapDbStatusToFormStatus,
  validateCatatHasilForm,
  type CatatHasilFormState,
  type FieldErrors,
} from '@/validation/konselingHasil'

const route = useRoute()
const router = useRouter()

const konselingId = computed(() => Number(route.params.id))

const loadingDetail = ref(true)
const submitting = ref(false)
const fieldErrors = ref<FieldErrors>({})

const form = ref<CatatHasilFormState>({
  summary: '',
  recommendation: '',
  status: '',
})

const studentLabel = ref('')

const loadDetail = async () => {
  if (!Number.isFinite(konselingId.value) || konselingId.value < 1) {
    toast.error('ID konseling tidak valid')
    router.push({ name: 'konseling-menunggu-hasil' })
    return
  }
  loadingDetail.value = true
  fieldErrors.value = {}
  try {
    const d = await konselingService.getDetailUntukWali(konselingId.value)
    studentLabel.value = `${d.studentName} — ${d.topic}`
    form.value.summary = d.summary?.trim() ?? ''
    form.value.recommendation = d.recommendation?.trim() ?? ''
    const mapped = mapDbStatusToFormStatus(d.status)
    form.value.status = mapped || ''
  } catch (e: unknown) {
    const msg =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Gagal memuat data konseling'
    toast.error(msg)
    router.push({ name: 'konseling-menunggu-hasil' })
  } finally {
    loadingDetail.value = false
  }
}

const submit = async () => {
  const v = validateCatatHasilForm(form.value)
  if (!v.ok) {
    fieldErrors.value = v.errors
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
    const res = await konselingService.catatHasil(konselingId.value, payload)
    toast.success(res.message || 'Hasil konseling berhasil disimpan')
    await router.push({ name: 'konseling-menunggu-hasil' })
  } catch (e: unknown) {
    const ax = e as { response?: { status?: number; data?: { message?: string; data?: Record<string, string> } } }
    const status = ax.response?.status
    const body = ax.response?.data
    if (status === 400 && body?.data && typeof body.data === 'object') {
      const serverErrors: FieldErrors = {}
      const d = body.data as Record<string, string>
      if (d.summary) serverErrors.summary = d.summary
      if (d.recommendation) serverErrors.recommendation = d.recommendation
      if (d.status) serverErrors.status = d.status
      fieldErrors.value = serverErrors
    }
    toast.error(body?.message || 'Gagal menyimpan hasil konseling')
  } finally {
    submitting.value = false
  }
}

const cancel = () => {
  router.push({ name: 'konseling-menunggu-hasil' })
}

onMounted(loadDetail)
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
    <div class="max-w-xl mx-auto">
      <button
        type="button"
        class="text-sm font-bold text-slate-500 hover:text-[#26A69A] mb-6"
        @click="cancel"
      >
        ← Kembali ke daftar
      </button>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <h1 class="text-xl font-black text-[#1A2342] mb-1">Catat Hasil Konseling</h1>
        <p v-if="studentLabel" class="text-sm text-slate-500 mb-6">{{ studentLabel }}</p>
        <p v-else class="text-sm text-slate-400 mb-6 animate-pulse">Memuat...</p>

        <div v-if="loadingDetail" class="py-12 text-center text-slate-400 text-sm">Memuat formulir...</div>

        <form v-else class="space-y-5" @submit.prevent="submit">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Ringkasan hasil konseling <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.summary"
              rows="4"
              class="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] border-slate-200"
              :class="{ 'border-red-300': fieldErrors.summary }"
              placeholder="Ringkasan hasil konseling"
            />
            <p v-if="fieldErrors.summary" class="text-xs text-red-500 mt-1">{{ fieldErrors.summary }}</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Rekomendasi / tindak lanjut <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.recommendation"
              rows="4"
              class="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] border-slate-200"
              :class="{ 'border-red-300': fieldErrors.recommendation }"
              placeholder="Rekomendasi atau tindak lanjut"
            />
            <p v-if="fieldErrors.recommendation" class="text-xs text-red-500 mt-1">{{ fieldErrors.recommendation }}</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Status <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.status"
              class="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] border-slate-200 bg-white"
              :class="{ 'border-red-300': fieldErrors.status }"
            >
              <option disabled value="">Pilih status</option>
              <option value="selesai">Selesai</option>
              <option value="perlu_monitoring">Perlu monitoring</option>
            </select>
            <p v-if="fieldErrors.status" class="text-xs text-red-500 mt-1">{{ fieldErrors.status }}</p>
          </div>

          <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              class="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm hover:bg-slate-50 transition"
              :disabled="submitting"
              @click="cancel"
            >
              Batal
            </button>
            <button
              type="submit"
              class="flex-1 bg-[#26A69A] text-white font-bold py-3 rounded-xl text-sm hover:bg-teal-600 transition shadow-sm disabled:opacity-60"
              :disabled="submitting"
            >
              <span v-if="submitting">Menyimpan...</span>
              <span v-else>Simpan Hasil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
