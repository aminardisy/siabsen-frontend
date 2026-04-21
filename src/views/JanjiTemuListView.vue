<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { janjiTemuService } from '@/services/janjiTemuService'
import { useAuthStore } from '@/stores/auth'
import type { JanjiTemuListItemResponse, JanjiTemuStatus } from '@/models/janjiTemu'

const router = useRouter()
const authStore = useAuthStore()

const janjiTemuList = ref<JanjiTemuListItemResponse[]>([])
const isLoading = ref(false)
const updatingStatusId = ref<number | null>(null)

const canManageJanjiTemu = computed(() => authStore.user?.role === 'SEKRETARIS')
const canUpdateStatus = computed(() => authStore.user?.role === 'GURU')

const fetchJanjiTemuList = async () => {
  isLoading.value = true
  try {
    janjiTemuList.value = await janjiTemuService.getAll()
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal memuat daftar janji temu'
    toast.error(message)
  } finally {
    isLoading.value = false
  }
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

const statusLabelMap: Record<JanjiTemuStatus, string> = {
  WAITING: 'Menunggu',
  // APPROVED: 'Disetujui',
  // REJECTED: 'Ditolak',
  FINISHED: 'Selesai',
}

const statusOptions: JanjiTemuStatus[] = ['WAITING','FINISHED']

const isStatusOptionDisabled = (currentStatus: JanjiTemuStatus, optionStatus: JanjiTemuStatus) => {
  return optionStatus !== currentStatus && optionStatus !== 'FINISHED'
}

const statusClassMap: Record<JanjiTemuStatus, string> = {
  WAITING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-rose-50 text-rose-700',
  FINISHED: 'bg-slate-100 text-slate-700',
}

const openDetail = (id: number) => {
  router.push(`/janji-temu/${id}`)
}

const handleStatusChange = async (item: JanjiTemuListItemResponse, event: Event) => {
  const selectedStatus = (event.target as HTMLSelectElement).value as JanjiTemuStatus
  if (!selectedStatus || selectedStatus === item.status) return

  updatingStatusId.value = item.id
  try {
    const response = await janjiTemuService.updateStatus(item.id, { status: selectedStatus })
    item.status = response.data.status
    toast.success(response.message || 'Status janji temu berhasil diperbarui')
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal memperbarui status janji temu'
    toast.error(message)
  } finally {
    updatingStatusId.value = null
  }
}

onMounted(fetchJanjiTemuList)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Daftar Janji Temu</h1>
        <p class="text-gray-500">Menampilkan jadwal janji temu sesuai akses pengguna yang sedang login.</p>
        <p class="text-xs text-gray-400 mt-1">Klik baris data untuk melihat detail janji temu.</p>
      </div>

      <button
        v-if="canManageJanjiTemu"
        @click="router.push('/janji-temu/create')"
        class="bg-[#26A69A] hover:bg-[#1f8a7f] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-100 transition-all"
      >
        + Buat Janji Temu
      </button>
    </div>

    <div v-if="isLoading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
      Memuat daftar janji temu...
    </div>

    <div
      v-else-if="janjiTemuList.length === 0"
      class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center"
    >
      <p class="text-lg font-semibold text-[#1A2342]">Tidak ada jadwal janji temu</p>
      <p class="text-sm text-gray-500 mt-1">Data janji temu belum tersedia.</p>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full border-collapse">
        <thead class="bg-gray-50/60 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4">Tanggal</th>
            <th class="px-6 py-4">Waktu</th>
            <th class="px-6 py-4">Nama Siswa</th>
            <th class="px-6 py-4">Status Pertemuan</th>
            <th v-if="canManageJanjiTemu || canUpdateStatus" class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="item in janjiTemuList"
            :key="item.id"
            class="hover:bg-slate-50 transition-colors cursor-pointer"
            tabindex="0"
            @click="openDetail(item.id)"
            @keydown.enter="openDetail(item.id)"
            @keydown.space.prevent="openDetail(item.id)"
          >
            <td class="px-6 py-4 text-sm font-medium text-gray-700">{{ formatTanggal(item.tanggal) }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-500 font-mono">{{ formatWaktu(item.waktu) }}</td>
            <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ item.namaSiswa }}</td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide',
                  statusClassMap[item.status],
                ]"
              >
                {{ statusLabelMap[item.status] }}
              </span>
            </td>
            <td v-if="canManageJanjiTemu || canUpdateStatus" class="px-6 py-4 text-center">
              <button
                v-if="canManageJanjiTemu"
                @click.stop="router.push(`/janji-temu/edit/${item.id}`)"
                class="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Edit
              </button>

              <select
                v-else
                :value="item.status"
                @click.stop
                @change="handleStatusChange(item, $event)"
                :disabled="item.status === 'FINISHED' || updatingStatusId === item.id"
                class="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 outline-none focus:ring-2 focus:ring-[#26A69A] disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option
                  v-for="status in statusOptions"
                  :key="status"
                  :value="status"
                  :disabled="isStatusOptionDisabled(item.status, status)"
                >
                  {{ statusLabelMap[status] }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
