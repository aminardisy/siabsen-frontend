<template>
  <div class="p-4 sm:p-6 bg-slate-50 min-h-screen font-inter">

    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 gap-4 text-left">
      <div class="w-full md:w-auto">
        <h1 class="text-xl sm:text-2xl font-bold text-[#1A2342]">Absensi Harian Siswa</h1>

        <div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span class="text-gray-500 font-medium">Kelas:</span>

          <span v-if="authStore.user?.role === 'SEKRETARIS'" class="font-bold text-[#26A69A] bg-teal-50 px-3 py-1 rounded-lg">
            {{ attendanceStore.allowedClasses[0]?.namaKelas || 'Memuat...' }}
          </span>

          <select
            v-else
            v-model="attendanceStore.selectedKelasId"
            @change="loadData"
            class="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-[#1A2342] shadow-sm outline-none focus:ring-2 focus:ring-[#26A69A] cursor-pointer text-sm"
          >
            <option :value="null" disabled>-- Pilih Kelas --</option>
            <option v-for="kelas in attendanceStore.allowedClasses" :key="kelas.id" :value="kelas.id">
              {{ kelas.namaKelas }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-200 w-full md:w-auto h-11">
        <span class="text-xs font-bold text-gray-400 uppercase mr-2 md:hidden">Tanggal Absen</span>
        <input
          type="date"
          v-model="selectedDate"
          @change="loadData"
          class="outline-none text-gray-700 bg-transparent cursor-pointer font-semibold text-sm w-full md:w-auto text-right md:text-left"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 text-left">
      <div
        v-for="(val, key) in attendanceStore.attendanceData.summary"
        :key="key"
        class="bg-white p-4 rounded-2xl shadow-sm border-b-4 border-[#26A69A] transition-transform hover:scale-[1.02]"
      >
        <p class="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 tracking-widest truncate">{{ key }}</p>
        <p class="text-xl sm:text-2xl font-black text-[#1A2342] mt-1">{{ val }}</p>
      </div>
    </div>

    <div v-if="attendanceStore.selectedKelasId" class="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200 text-left">
      <div class="overflow-x-auto w-full custom-scrollbar">
        <table class="w-full text-left min-w-[600px] border-collapse">
          <thead class="bg-[#1A2342] text-white text-xs font-bold uppercase tracking-wider">
            <tr>
              <th class="px-4 sm:px-6 py-4 w-16 text-center">No</th>
              <th class="px-4 sm:px-6 py-4">Nama Siswa</th>
              <th class="px-4 sm:px-6 py-4 text-center w-[340px]">Status Kehadiran</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(siswa, index) in attendanceStore.attendanceData.students"
              :key="siswa.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-4 sm:px-6 py-3.5 text-sm text-gray-400 font-mono text-center">{{ index + 1 }}</td>
              <td class="px-4 sm:px-6 py-3.5 text-sm font-semibold text-slate-700 whitespace-nowrap">
                {{ siswa.nama }}
              </td>
              <td class="px-4 sm:px-6 py-3.5">
                <div class="flex justify-center gap-1 sm:gap-2">
                  <button
                    v-for="status in ['HADIR', 'SAKIT', 'IZIN', 'ALPHA']"
                    :key="status"
                    @click="updateLocalStatus(siswa.id, status)"
                    :disabled="isStatusDisabled"
                    :class="[
                      'flex-1 sm:flex-initial px-2.5 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black transition-all duration-200 uppercase tracking-wider',
                      siswa.status === status
                        ? getStatusColor(status)
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200 disabled:opacity-60'
                    ]"
                  >
                    {{ status }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="bg-white p-12 sm:p-20 rounded-2xl border-2 border-dashed border-slate-200 text-center">
      <div class="text-3xl sm:text-4xl mb-3">📅</div>
      <p class="text-slate-400 text-sm sm:text-base font-medium max-w-sm mx-auto">
        Silakan pilih kelas terlebih dahulu untuk melihat dan mengelola data absensi harian.
      </p>
    </div>

    <div class="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3">
      <p v-if="attendanceStore.isLoading" class="text-sm text-gray-400 text-center sm:text-left animate-pulse py-2">
        Memproses data...
      </p>

      <button
        v-if="authStore.user?.role === 'SEKRETARIS' && !attendanceStore.isLocked"
        @click="handleMainAction"
        :class="[
          'w-full sm:w-auto px-8 h-12 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 text-sm',
          attendanceStore.isSubmitted ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-[#1A2342] hover:bg-slate-800 shadow-slate-100'
        ]"
      >
        {{ attendanceStore.isSubmitted ? 'Update Laporan' : 'Kirim Laporan' }}
      </button>

      <button
        v-if="authStore.user?.role === 'GURU' && attendanceStore.isSubmitted && !attendanceStore.isLocked"
        @click="handleApprove"
        class="w-full sm:w-auto px-8 h-12 bg-[#26A69A] rounded-xl font-bold text-white hover:bg-[#1f8a7f] shadow-md shadow-teal-100 active:scale-95 transition-all text-sm"
      >
        Setujui Laporan (Approve)
      </button>

      <div
        v-if="attendanceStore.isLocked"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-50 text-green-700 px-6 h-12 rounded-xl font-bold border border-green-200 text-sm animate-in fade-in duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
        Laporan Terkunci & Disetujui
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useAuthStore } from '@/stores/auth'

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

const selectedDate = ref(new Date().toISOString().substr(0, 10))

// Logika status interaktivitas tombol
const isStatusDisabled = computed(() => {
  if (attendanceStore.isLocked) return true
  if (authStore.user?.role === 'SEKRETARIS' && attendanceStore.isSubmitted) return true
  if (authStore.user?.role === 'ADMIN') return true
  return false
})

const loadData = async () => {
  if (attendanceStore.selectedKelasId) {
    await attendanceStore.fetchAttendance(attendanceStore.selectedKelasId, selectedDate.value)
  }
}

const updateLocalStatus = (siswaId: number, status: string) => {
  const siswa = attendanceStore.attendanceData.students.find(s => s.id === siswaId)
  if (siswa) {
    siswa.status = status
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'HADIR': return 'bg-[#26A69A] text-white shadow-md shadow-teal-100/50'
    case 'SAKIT': return 'bg-yellow-500 text-white shadow-md shadow-yellow-100/50'
    case 'IZIN': return 'bg-blue-500 text-white shadow-md shadow-blue-100/50'
    case 'ALPHA': return 'bg-red-500 text-white shadow-md shadow-red-100/50'
    default: return 'bg-slate-100 text-slate-400'
  }
}

const handleMainAction = async () => {
  if (!attendanceStore.selectedKelasId) return

  const payload = {
    kelasId: attendanceStore.selectedKelasId,
    tanggal: selectedDate.value,
    attendanceList: attendanceStore.attendanceData.students.map(s => ({
      studentId: s.id,
      status: s.status
    }))
  }

  try {
    await attendanceStore.submitAttendance(payload)
    alert('Laporan berhasil dikirim!')
  } catch (error: any) {
    alert('Gagal mengirim: ' + error.message)
  }
}

const handleApprove = async () => {
  if (confirm('Setujui laporan hari ini? Data tidak akan bisa diubah lagi.')) {
    try {
      await attendanceStore.approveAttendance(attendanceStore.selectedKelasId!, selectedDate.value)
      alert('Laporan disetujui Wali Kelas!')
    } catch (error: any) {
      alert('Gagal approve: ' + error.message)
    }
  }
}

onMounted(async () => {
  await attendanceStore.fetchAllowedClasses()
  if (attendanceStore.selectedKelasId) {
    await loadData()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
