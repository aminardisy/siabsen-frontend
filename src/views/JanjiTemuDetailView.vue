<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { janjiTemuService } from '@/services/janjiTemuService'
import { useAuthStore } from '@/stores/auth'
import type { JanjiTemuDetailResponse, JanjiTemuStatus } from '@/models/janjiTemu'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const janjiTemuId = Number(route.params.id)
const isLoading = ref(false)
const isUpdatingStatus = ref(false)
const detail = ref<JanjiTemuDetailResponse | null>(null)

const canEdit = computed(() => authStore.user?.role === 'SEKRETARIS')
const canUpdateStatus = computed(() => authStore.user?.role === 'GURU')

const statusLabelMap: Record<JanjiTemuStatus, string> = {
  WAITING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  FINISHED: 'Selesai',
}

const statusOptions: JanjiTemuStatus[] = ['WAITING', 'APPROVED', 'REJECTED', 'FINISHED']

const isStatusOptionDisabled = (currentStatus: JanjiTemuStatus, optionStatus: JanjiTemuStatus) => {
  if (currentStatus === optionStatus) return false
  if (currentStatus === 'WAITING') return optionStatus === 'WAITING'
  if (currentStatus === 'APPROVED') return optionStatus !== 'FINISHED'
  return true
}

const statusClassMap: Record<JanjiTemuStatus, string> = {
  WAITING: 'bg-amber-50 text-amber-700 border-amber-100',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-100',
  FINISHED: 'bg-slate-100 text-slate-700 border-slate-200',
}

const formatTanggal = (tanggal: string) => {
  if (!tanggal) return '-'

  const date = new Date(`${tanggal}T00:00:00`)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const formatWaktu = (waktu: string) => {
  if (!waktu) return '-'
  return waktu.slice(0, 5)
}

const fetchDetail = async () => {
  if (!janjiTemuId) {
    toast.error('ID janji temu tidak valid')
    router.push('/janji-temu')
    return
  }

  isLoading.value = true
  try {
    detail.value = await janjiTemuService.getById(janjiTemuId)
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal memuat detail janji temu'
    toast.error(message)
    router.push('/janji-temu')
  } finally {
    isLoading.value = false
  }
}

const handleStatusChange = async (event: Event) => {
  if (!detail.value) return

  const selectedStatus = (event.target as HTMLSelectElement).value as JanjiTemuStatus
  if (!selectedStatus || selectedStatus === detail.value.status) return

  isUpdatingStatus.value = true
  try {
    const response = await janjiTemuService.updateStatus(detail.value.id, { status: selectedStatus })
    detail.value.status = response.data.status
    toast.success(response.message || 'Status janji temu berhasil diperbarui')
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal memperbarui status janji temu'
    toast.error(message)
  } finally {
    isUpdatingStatus.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Detail Janji Temu</h1>
        <p class="text-gray-500">Informasi lengkap pertemuan antara siswa dan guru.</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="router.push('/janji-temu')"
          class="px-4 py-2 text-gray-500 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          Kembali
        </button>

        <button
          v-if="canEdit && detail"
          type="button"
          @click="router.push(`/janji-temu/edit/${detail.id}`)"
          class="px-4 py-2 bg-[#1A2342] text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          Edit Janji Temu
        </button>

        <select
          v-if="canUpdateStatus && detail"
          :value="detail.status"
          @change="handleStatusChange"
          :disabled="detail.status === 'FINISHED' || detail.status === 'REJECTED' || isUpdatingStatus"
          class="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 outline-none focus:ring-2 focus:ring-[#26A69A] disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option
            v-for="status in statusOptions"
            :key="status"
            :value="status"
            :disabled="isStatusOptionDisabled(detail.status, status)"
          >
            {{ statusLabelMap[status] }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
      Memuat detail janji temu...
    </div>

    <div v-else-if="!detail" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
      <p class="text-lg font-semibold text-[#1A2342]">Detail janji temu tidak ditemukan</p>
    </div>

    <div v-else class="space-y-5">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Tanggal & Waktu Pertemuan</p>
            <h2 class="text-xl font-bold text-[#1A2342]">{{ formatTanggal(detail.tanggal) }}, {{ formatWaktu(detail.waktu) }} - {{ formatWaktu(detail.waktuSelesai) }}</h2>
          </div>

          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 text-right">Lokasi</p>
            <h2 class="text-xl font-bold text-[#1A2342] text-right">{{ detail.lokasi || '-' }}</h2>
          </div>

          <span
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border',
              statusClassMap[detail.status],
            ]"
          >
            {{ statusLabelMap[detail.status] }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-sm font-black uppercase tracking-wider text-[#1A2342] mb-4">Detail Siswa</h3>
          <dl class="space-y-3">
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">Nama</dt>
              <dd class="text-gray-800 font-semibold text-right">{{ detail.siswa.nama || '-' }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">NISN</dt>
              <dd class="text-gray-800 font-semibold text-right">{{ detail.siswa.nisn || '-' }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">Kelas</dt>
              <dd class="text-gray-800 font-semibold text-right">{{ detail.siswa.namaKelas || '-' }}</dd>
            </div>
          </dl>
        </section>

        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-sm font-black uppercase tracking-wider text-[#1A2342] mb-4">Detail Guru</h3>
          <dl class="space-y-3">
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">Nama</dt>
              <dd class="text-gray-800 font-semibold text-right">{{ detail.guru.nama || '-' }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">NUPTK</dt>
              <dd class="text-gray-800 font-semibold text-right">{{ detail.guru.nuptk || '-' }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-sm font-black uppercase tracking-wider text-[#1A2342] mb-3">Tujuan/Catatan Pertemuan</h3>
        <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ detail.keperluan || '-' }}</p>
      </section>
    </div>
  </div>
</template>
