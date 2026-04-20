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

const canManageJanjiTemu = computed(() => authStore.user?.role === 'SEKRETARIS')

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
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  FINISHED: 'Selesai',
}

const statusClassMap: Record<JanjiTemuStatus, string> = {
  WAITING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-rose-50 text-rose-700',
  FINISHED: 'bg-slate-100 text-slate-700',
}

onMounted(fetchJanjiTemuList)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Daftar Janji Temu</h1>
        <p class="text-gray-500">Menampilkan jadwal janji temu sesuai akses pengguna yang sedang login.</p>
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
            <th v-if="canManageJanjiTemu" class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-50">
          <tr v-for="item in janjiTemuList" :key="item.id" class="hover:bg-slate-50 transition-colors">
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
            <td v-if="canManageJanjiTemu" class="px-6 py-4 text-center">
              <button
                @click="router.push(`/janji-temu/edit/${item.id}`)"
                class="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
