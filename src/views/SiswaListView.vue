<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 text-left">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Manajemen Data Siswa</h1>
        <p class="text-gray-500 text-sm">Kelola profil murid dan status keaktifan sekolah</p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        <BaseSearch v-model="searchQuery" placeholder="Cari Nama, NISN, atau Kelas..." class="w-full sm:w-64 h-11" />

        <input type="file" ref="fileInputSiswa" class="hidden" accept=".xlsx, .xls" @change="handleImportSiswa" />

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="/templates/Template_Import_Siswa.xlsx"
            download="Template_Import_Siswa.xlsx"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Template
          </a>

          <button
            @click="fileInputSiswa?.click()"
            type="button"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-[#1A2342] rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Import
          </button>

          <button
            @click="openModal('add')"
            type="button"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 h-11 px-5 bg-[#26A69A] hover:bg-[#1f8a7f] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-100/50 whitespace-nowrap"
          >
            <span>+</span> Siswa
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left">
      <table class="w-full border-collapse">
        <thead class="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4">NISN</th>
            <th class="px-6 py-4">Nama Lengkap</th>
            <th class="px-6 py-4">Kelas</th>
            <th class="px-6 py-4 text-center">Jenis Kelamin</th>
            <th class="px-6 py-4 text-center">Status</th>
            <th class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="s in filteredSiswa" :key="s.id" class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 text-sm font-medium text-gray-500 font-mono">{{ s.nisn }}</td>
            <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ s.nama }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ s.namaKelas || '-' }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 text-center">{{ s.jenisKelamin === 'LAKI_LAKI' || s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}</td>
            <td class="px-6 py-4 text-center">
              <span :class="s.status === 'Aktif' ? 'bg-teal-50 text-[#26A69A]' : 'bg-red-50 text-red-500'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {{ s.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex justify-center gap-3">
                <button @click="openModal('edit', s)" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Data">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button v-if="s.status === 'Aktif'" @click="openDeactivateModal(s.id, s.nama)" class="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Nonaktifkan">
                  <svg xmlns="http://www.w3.org/2000/xl" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A2342]/40 backdrop-blur-sm p-4 text-left">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ modalMode === 'add' ? 'Tambah Siswa Baru' : 'Perbarui Data Siswa' }}</h3>
          <button @click="isModalOpen = false" class="text-sm hover:rotate-90 transition-transform font-bold">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">NISN (10 Digit)</label>
            <input v-model="formSiswa.nisn" @input="handleNisnInput" type="text" maxlength="10" placeholder="Contoh: 0012345678" :class="['w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 transition-all', isNisnHInvalid ? 'border-red-400 focus:ring-red-100' : 'border-gray-100 focus:ring-[#26A69A]']" required />

            <p v-if="isNisnHInvalid" class="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              NISN harus tepat 10 digit (Saat ini: {{ formSiswa.nisn.length }})
            </p>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Nama Lengkap Murid</label>
            <input v-model="formSiswa.namaLengkap" type="text" placeholder="Masukkan nama sesuai ijazah" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Pilih Kelas</label>
              <select v-model="formSiswa.kelasId" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]" required>
                <option :value="null" disabled>-- Pilih Kelas --</option>
                <option v-for="k in daftarKelas" :key="k.id" :value="k.id">{{ k.namaKelas }}</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Jenis Kelamin</label>
              <select v-model="formSiswa.jenisKelamin" class="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A]">
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>
          </div>

          <div class="flex gap-4 pt-6">
            <button type="button" @click="isModalOpen = false" class="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl">Batal</button>
            <button type="submit" :disabled="!isFormValid" :class="['flex-1 py-3 text-white rounded-xl font-bold shadow-xl transition-all', isFormValid ? 'bg-[#1A2342] hover:bg-slate-800' : 'bg-gray-300 cursor-not-allowed']">
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isDeactivateModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A2342]/40 backdrop-blur-sm p-4 text-left">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8">

        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <div class="flex-1">
            <h3 class="text-xl font-black text-[#1A2342]">Nonaktifkan Siswa</h3>
            <p class="text-sm text-slate-400 font-medium mt-1">
              Anda akan menonaktifkan data murid bernama <span class="text-red-600 font-bold">{{ selectedSiswaName }}</span>.
            </p>
          </div>
        </div>

        <div class="mt-5 space-y-2">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Alasan Penonaktifan</label>
          <select
            v-model="alasanNonaktif"
            class="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl outline-none font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all text-sm cursor-pointer"
          >
            <option value="Lulus">Lulus Sekolah</option>
            <option value="Pindah Sekolah">Pindah Sekolah</option>
            <option value="Drop Out (DO)">Drop Out (DO)</option>
            <option value="Lainnya">Lainnya / Mengundurkan Diri</option>
          </select>
        </div>

        <div class="mt-8 flex flex-col-reverse sm:flex-row justify-end items-center gap-2.5">
          <button
            type="button"
            @click="isDeactivateModalOpen = false"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            @click="submitNonaktif"
            class="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-100 active:scale-95 transition-all"
          >
            Konfirmasi Nonaktif
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { SiswaResponse, SiswaRequest } from '@/models/siswa'
import { siswaService, importSiswaExcel } from '@/services/siswaService'
import { kelasService } from '@/services/kelasService'
import BaseSearch from '@/components/layout/BaseSearch.vue'

// 1. State Management
const siswaList = ref<SiswaResponse[]>([])
const daftarKelas = ref<any[]>([])
const searchQuery = ref('')
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')

// FIX: State Tambahan untuk Mengontrol Modal Deaktivasi dengan Alasan
const isDeactivateModalOpen = ref(false)
const selectedSiswaId = ref<number | null>(null)
const selectedSiswaName = ref('')
const alasanNonaktif = ref('Pindah Sekolah') // Nilai default dropdown

// State Form
const formSiswa = ref<SiswaRequest & { id?: number }>({
  id: undefined,
  nisn: '',
  namaLengkap: '',
  kelasId: null,
  jenisKelamin: 'LAKI_LAKI',
})

// 2. Logic: Validasi NISN (10 Digit)
const isNisnHInvalid = computed(() => {
  const val = formSiswa.value.nisn
  return val.length > 0 && val.length !== 10
})

const isFormValid = computed(() => {
  return (
    formSiswa.value.namaLengkap &&
    formSiswa.value.namaLengkap.trim().length > 0 &&
    formSiswa.value.nisn.length === 10 &&
    formSiswa.value.kelasId !== null &&
    !isNisnHInvalid.value
  )
})

// 3. Logic: Search & Filter
const filteredSiswa = computed(() => {
  if (!siswaList.value) return []
  const query = searchQuery.value.toLowerCase()
  return siswaList.value.filter(s =>
    s.nama.toLowerCase().includes(query) ||
    s.nisn.includes(query) ||
    s.namaKelas.toLowerCase().includes(query)
  )
})

// 4. API Functions
const fetchData = async () => {
  try {
    const [resSiswa, resKelas] = await Promise.all([
      siswaService.getAll(),
      kelasService.getAll()
    ])
    siswaList.value = resSiswa
    daftarKelas.value = resKelas
  } catch (error) {
    toast.error('Gagal mengambil data dari server')
  }
}

const handleNisnInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  formSiswa.value.nisn = target.value.replace(/\D/g, '').slice(0, 10)
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    const nisn = formSiswa.value.nisn.trim()

    if (!/^\d{10}$/.test(nisn)) {
      toast.error('NISN harus berupa 10 digit angka')
      return
    }

    formSiswa.value.nisn = nisn

    if (modalMode.value === 'add') {
      await siswaService.create(formSiswa.value)
      toast.success('Siswa baru berhasil ditambahkan')
    } else {
      await siswaService.update(formSiswa.value.id!, formSiswa.value)
      toast.success('Data siswa berhasil diperbarui')
    }
    isModalOpen.value = false
    fetchData()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan data')
  }
}

// FIX: Fungsi baru untuk memicu pembukaan modal penonaktifan
const openDeactivateModal = (id: number, nama: string) => {
  selectedSiswaId.value = id
  selectedSiswaName.value = nama
  alasanNonaktif.value = 'Pindah Sekolah' // Reset pilihan ke default setiap kali dibuka
  isDeactivateModalOpen.value = true
}

// FIX: Fungsi final eksekusi pendaftaran data ke backend Spring Boot setelah dikonfirmasi
const submitNonaktif = async () => {
  if (!selectedSiswaId.value) return
  try {
    await siswaService.deactivate(selectedSiswaId.value, alasanNonaktif.value)
    toast.success(`Status ${selectedSiswaName.value} berhasil diubah menjadi Nonaktif`)
    isDeactivateModalOpen.value = false
    fetchData()
  } catch (error) {
    toast.error('Gagal memperbarui status siswa')
  } finally {
    selectedSiswaId.value = null
  }
}

const openModal = (mode: 'add' | 'edit', data: SiswaResponse | null = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    const selectedKelas = daftarKelas.value.find(k => k.namaKelas === data.namaKelas)
    formSiswa.value = {
      id: data.id,
      nisn: data.nisn,
      namaLengkap: data.nama,
      kelasId: selectedKelas ? selectedKelas.id : null,
      jenisKelamin: data.jenisKelamin === 'L' || data.jenisKelamin === 'LAKI_LAKI' ? 'LAKI_LAKI' : 'PEREMPUAN',
    }
  } else {
    formSiswa.value = { id: undefined, nisn: '', namaLengkap: '', kelasId: null, jenisKelamin: 'LAKI_LAKI' }
  }
  isModalOpen.value = true
}

const fileInputSiswa = ref<HTMLInputElement | null>(null)

const handleImportSiswa = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    try {
      const res = await importSiswaExcel(file)
      toast.success(res.message || 'Data siswa berhasil diimpor!')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengimpor data siswa. Periksa format kolom Excel Anda.')
    } finally {
      target.value = ''
    }
  }
}

onMounted(fetchData)
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
