<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import * as konselingService from '@/services/konselingService'
import type { RiwayatKonseling } from '@/models/konseling'

const router = useRouter()
const items = ref<RiwayatKonseling[]>([])
const loading = ref(true)

const formatDate = (d: string) => {
  if (!d) return '-'
  return new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const load = async () => {
  loading.value = true
  try {
    items.value = await konselingService.listMenungguHasilForWali()
  } catch (e: any) {
    const msg = e.response?.data?.message || 'Gagal memuat daftar konseling'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

const goCatat = (id: number) => {
  router.push({ name: 'catat-hasil-konseling', params: { id: String(id) } })
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
    <div class="max-w-5xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-black text-[#1A2342] tracking-tight">Catat Hasil Konseling</h1>
          <p class="text-sm text-slate-500 mt-1">
            Jadwal konseling berstatus PENDING untuk kelas Anda. Pilih siswa untuk mengisi ringkasan dan tindak lanjut.
          </p>
        </div>
        <button
          type="button"
          class="text-sm font-bold text-[#26A69A] hover:underline self-start md:self-auto flex items-center gap-1"
          @click="load"
          :disabled="loading"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Muat ulang
        </button>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div v-if="loading" class="p-16 text-center text-slate-400 text-sm animate-pulse">Memuat...</div>
        <table v-else class="w-full text-left border-collapse">
          <thead class="bg-[#1A2342] text-white text-[10px] uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Siswa</th>
              <th class="px-6 py-4">Tanggal</th>
              <th class="px-6 py-4">Topik</th>
              <th class="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="items.length === 0">
              <td colspan="4" class="px-6 py-14 text-center text-slate-400 text-sm">
                Tidak ada jadwal konseling yang menunggu hasil.
              </td>
            </tr>
            <tr v-for="row in items" :key="row.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4">
                <p class="font-semibold text-slate-800 text-sm">{{ row.siswaNama || '-' }}</p>
                <p class="text-xs text-slate-400 font-mono">{{ row.siswaNisn || '-' }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 font-medium">{{ formatDate(row.date) }}</td>
              <td class="px-6 py-4">
                <p class="text-sm text-slate-700 max-w-xs truncate" :title="row.topic">{{ row.topic }}</p>
                <p v-if="row.jenisPelanggaran" class="text-[10px] text-[#26A69A] font-bold uppercase">{{ row.jenisPelanggaran }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <button
                  type="button"
                  class="bg-[#26A69A] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#1f8c82] transition shadow-sm active:scale-95"
                  @click="goCatat(row.id)"
                >
                  Catat hasil
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
