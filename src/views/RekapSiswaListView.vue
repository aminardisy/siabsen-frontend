<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { siswaService } from '@/services/siswaService'
import { useRouter } from 'vue-router'

const router = useRouter()
const students = ref<any[]>([])
const searchQuery = ref('')
const selectedClass = ref('Semua Kelas')
const isLoading = ref(true)

// Ambil daftar kelas unik dari data siswa (atau hardcoded jika perlu)
const classes = computed(() => {
  const unique = new Set(students.value.map(s => s.namaKelas))
  return ['Semua Kelas', ...Array.from(unique)].sort()
})

const filteredStudents = computed(() => {
  return students.value.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        s.nisn.includes(searchQuery.value)
    const matchClass = selectedClass.value === 'Semua Kelas' || s.namaKelas === selectedClass.value
    return matchSearch && matchClass
  })
})

const goToDetail = (id: number) => {
  router.push({ name: 'rekap-siswa-detail', params: { id } })
}

onMounted(async () => {
  try {
    students.value = await siswaService.getAll()
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="p-8 bg-slate-50 min-h-screen text-left">
    <div class="mb-8">
      <h1 class="text-3xl font-black text-[#1A2342]">Pusat Laporan & Rekap</h1>
      <p class="text-gray-400 mt-1">Pilih data siswa untuk melihat statistik absensi mendalam</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="md:col-span-2 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari Nama atau NISN..."
          class="w-full bg-white border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#26A69A] shadow-sm transition-all"
        />
        <span class="absolute right-4 top-4 text-gray-300">🔍</span>
      </div>
      <select
        v-model="selectedClass"
        class="bg-white border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#26A69A] shadow-sm font-bold text-slate-600"
      >
        <option v-for="c in classes" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="h-32 bg-gray-100 animate-pulse rounded-3xl"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="s in filteredStudents"
        :key="s.id"
        @click="goToDetail(s.id)"
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#26A69A] transition-all cursor-pointer group"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="w-12 h-12 bg-teal-50 text-[#26A69A] flex items-center justify-center rounded-2xl font-black text-xl group-hover:bg-[#26A69A] group-hover:text-white transition-colors">
            {{ s.nama.charAt(0) }}
          </div>
          <span class="text-[10px] font-black uppercase px-2 py-1 bg-slate-50 text-slate-400 rounded-lg">
            {{ s.namaKelas }}
          </span>
        </div>
        <h3 class="font-bold text-slate-800 truncate">{{ s.nama }}</h3>
        <p class="text-xs text-gray-400 font-mono mt-1">{{ s.nisn }}</p>

        <div class="mt-6 flex items-center text-[#26A69A] text-xs font-black uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Lihat Laporan Lengkap <span>→</span>
        </div>
      </div>
    </div>

    <div v-if="filteredStudents.length === 0 && !isLoading" class="text-center py-20">
      <p class="text-gray-400 font-medium">Siswa tidak ditemukan. Coba kata kunci lain.</p>
    </div>
  </div>
</template>
