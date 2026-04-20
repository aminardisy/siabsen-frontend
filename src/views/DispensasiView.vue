<template>
  <div class="p-6 bg-slate-50 min-h-screen">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#1A2342]">Dispensasi & Izin Siswa</h1>
        <p class="text-sm text-gray-400 mt-1">Pencatatan izin dan dispensasi harian</p>
      </div>
      <div class="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <span class="text-gray-400 text-sm font-medium">Tanggal</span>
        <input
          type="date"
          v-model="selectedDate"
          class="outline-none text-gray-700 bg-transparent cursor-pointer font-semibold"
        />
      </div>
    </div>

    <div class="flex flex-col xl:flex-row gap-6">

      <!-- ── LEFT: Form + Tabel ── -->
      <div class="flex-1 flex flex-col gap-6">

        <!-- Search Siswa -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Cari Siswa</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Ketik nama atau NISN siswa..."
              class="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#26A69A] focus:border-transparent transition"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <!-- Dropdown hasil search -->
          <div v-if="searchQuery && filteredSiswa.length > 0" class="mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-lg">
            <div
              v-for="siswa in filteredSiswa.slice(0, 5)"
              :key="siswa.id"
              @click="pilihSiswa(siswa)"
              class="flex items-center justify-between px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div>
                <p class="text-sm font-semibold text-[#1A2342]">{{ siswa.nama }}</p>
                <p class="text-xs text-gray-400 font-mono">{{ siswa.nisn }}</p>
              </div>
              <!-- PERBAIKAN: pakai namaKelas langsung, bukan kelas?.namaKelas -->
              <span class="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-medium">{{ siswa.namaKelas }}</span>
            </div>
          </div>

          <!-- Tidak ditemukan -->
          <div v-if="searchQuery && filteredSiswa.length === 0" class="mt-2 px-4 py-3 text-sm text-gray-400 text-center border border-slate-200 rounded-xl">
            Siswa tidak ditemukan
          </div>

          <!-- Siswa terpilih -->
          <div v-if="selectedSiswa" class="mt-3 flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
            <div>
              <p class="text-sm font-bold text-[#1A2342]">{{ selectedSiswa.nama }}</p>
              <!-- PERBAIKAN: pakai namaKelas langsung -->
              <p class="text-xs text-gray-500 font-mono">{{ selectedSiswa.nisn }} · {{ selectedSiswa.namaKelas }}</p>
            </div>
            <button @click="selectedSiswa = null; searchQuery = ''" class="text-xs text-red-400 hover:text-red-600 font-medium">Ganti</button>
          </div>
        </div>

        <!-- Form Dispensasi -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Detail Dispensasi</label>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Tanggal Mulai -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal Mulai <span class="text-red-400">*</span></label>
              <input
                type="date"
                v-model="form.tanggalMulai"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
              />
            </div>

            <!-- Tanggal Selesai -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal Selesai <span class="text-red-400">*</span></label>
              <input
                type="date"
                v-model="form.tanggalSelesai"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
              />
            </div>
          </div>

          <!-- Jenis Keterangan -->
          <div class="mt-4">
            <label class="block text-xs font-semibold text-gray-500 mb-2">Jenis Keterangan <span class="text-red-400">*</span></label>
            <div class="flex gap-3">
              <label
                v-for="opt in jenisOptions"
                :key="opt.value"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer font-semibold text-sm transition-all"
                :class="form.type === opt.value
                  ? 'border-[#26A69A] bg-teal-50 text-[#26A69A]'
                  : 'border-slate-200 text-slate-400 hover:border-slate-300'"
              >
                <input type="radio" v-model="form.type" :value="opt.value" class="hidden" />
                {{ opt.label }}
              </label>
            </div>
          </div>

          <!-- Alasan -->
          <div class="mt-4">
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Alasan <span class="text-red-400">*</span></label>
            <textarea
              v-model="form.alasan"
              rows="3"
              placeholder="Tuliskan alasan dispensasi..."
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition resize-none"
            ></textarea>
          </div>

          <!-- Link Dokumen -->
          <div class="mt-4">
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Link Dokumen Pendukung <span class="text-gray-400 font-normal">(opsional)</span></label>
            <input
              type="url"
              v-model="form.buktiDocUrl"
              placeholder="https://drive.google.com/..."
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
            />
          </div>

          <!-- Error -->
          <div v-if="formError" class="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {{ formError }}
          </div>
        </div>

        <!-- Tombol Simpan -->
        <div class="flex justify-end">
          <button
            @click="openPreviewModal"
            :disabled="dispensasiStore.isLoading"
            class="px-8 py-3 bg-[#1A2342] rounded-xl font-bold text-white hover:bg-[#26A69A] shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ dispensasiStore.isLoading ? 'Menyimpan...' : 'Simpan Dispensasi' }}
          </button>
        </div>

        <!-- Tabel Riwayat Dispensasi -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="font-bold text-[#1A2342]">Riwayat Dispensasi</h2>
            <span class="text-xs text-gray-400">{{ dispensasiStore.dispensasiList.length }} data</span>
          </div>

          <div v-if="dispensasiStore.isLoading" class="p-12 text-center text-gray-400 text-sm animate-pulse">
            Memuat data...
          </div>

          <table v-else class="w-full text-left">
            <thead class="bg-[#1A2342] text-white">
              <tr>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">No</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Siswa</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Periode</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Jenis</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Status</th>
                <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="dispensasiStore.dispensasiList.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-400 text-sm">Belum ada data dispensasi</td>
              </tr>
              <tr
                v-for="(item, index) in dispensasiStore.dispensasiList"
                :key="item.id"
                class="hover:bg-slate-50/80 transition-colors"
              >
                <td class="px-6 py-4 text-sm text-gray-400 font-mono">{{ index + 1 }}</td>
                <td class="px-6 py-4">
                  <p class="font-semibold text-slate-700 text-sm">{{ item.siswaNama }}</p>
                  <p class="text-xs text-gray-400 font-mono">{{ item.siswaNisn }}</p>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">
                  {{ formatDate(item.tanggalMulai) }} – {{ formatDate(item.tanggalSelesai) }}
                </td>
                <!-- Tambah ini -->
                <td class="px-6 py-4 text-center">
                  <span
                    :class="{
                      'bg-blue-100 text-blue-600':     item.jenis === 'DISPENSASI',
                      'bg-yellow-100 text-yellow-600': item.jenis === 'SAKIT',
                      'bg-green-100 text-green-600':   item.jenis === 'IZIN',
                    }"
                    class="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  >
                    {{ { DISPENSASI: 'Dispen', SAKIT: 'Sakit', IZIN: 'Izin' }[item.jenis] || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="badgeClass(item.statusApproval)" class="px-3 py-1 rounded-full text-[11px] font-bold">
                    {{ item.statusApproval }}
                  </span>
                </td>

                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">

                    <!-- Tombol Edit -->
                    <button
                      v-if="item.statusApproval !== 'CLOSED'"
                      @click="openEditModal(item)"
                      class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <!-- Dropdown Update Status (hanya jika bukan CLOSED) -->
                    <select
                      v-if="item.statusApproval !== 'CLOSED'"
                      @change="handleUpdateStatus(item.id, ($event.target as HTMLSelectElement).value)"
                      :value="item.statusApproval"
                      class="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#26A69A] cursor-pointer font-semibold"
                      :class="{
                        'text-yellow-600 bg-yellow-50': item.statusApproval === 'PENDING',
                        'text-green-600 bg-green-50':  item.statusApproval === 'APPROVED',
                        'text-red-500 bg-red-50':      item.statusApproval === 'REJECTED',
                      }"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="CLOSED">Closed</option>
                    </select>

                    <span v-if="item.statusApproval === 'CLOSED'" class="text-xs text-gray-300 font-medium">Closed</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── RIGHT: Kalender + Izin Aktif ── -->
      <div class="xl:w-72 flex flex-col gap-6">

        <!-- Kalender -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <button @click="prevMonth" class="text-gray-400 hover:text-[#26A69A] text-lg font-bold transition">‹</button>
            <span class="text-sm font-bold text-[#1A2342]">{{ namabulan }} {{ tahunKalender }}</span>
            <button @click="nextMonth" class="text-gray-400 hover:text-[#26A69A] text-lg font-bold transition">›</button>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center">
            <div v-for="h in hariSingkat" :key="h" class="text-[10px] font-bold text-gray-400 py-1">{{ h }}</div>
            <div v-for="(day, idx) in hariKalender" :key="idx"
              class="py-1.5 text-xs rounded-lg cursor-pointer transition-colors"
              :class="{
                'invisible': !day,
                'bg-[#1A2342] text-white font-bold': day === hariIni && bulanKalender === bulanIni && tahunKalender === tahunIni,
                'bg-[#26A69A] text-white font-bold': day === hariDipilih && !(day === hariIni && bulanKalender === bulanIni && tahunKalender === tahunIni),
                'hover:bg-slate-100 text-slate-600': day && day !== hariIni && day !== hariDipilih
              }"
              @click="day && pilihHari(day)"
            >
              {{ day || '' }}
            </div>
          </div>
        </div>

        <!-- Izin Aktif Hari Ini -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex-1">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Izin Aktif Hari ini</h3>

          <div v-if="dispensasiStore.izinAktifHariIni.length === 0" class="py-8 text-center text-gray-400 text-sm">
            Belum ada izin aktif hari ini
          </div>

          <div class="space-y-3">
            <div
              v-for="item in dispensasiStore.izinAktifHariIni"
              :key="item.id"
              class="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-b-0"
            >
              <div>
                <p class="text-sm font-semibold text-slate-700">{{ item.siswaNama }}</p>
                <p class="text-xs text-gray-400">{{ item.siswaNisn }}</p>
              </div>
              <span :class="jenisBadgeClass(item.statusApproval)" class="text-[11px] font-bold px-2.5 py-1 rounded-full">
                {{ jenisLabel(item.statusApproval) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal Preview (ATD-07) ── -->
    <div v-if="showPreviewModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100">
          <h2 class="text-lg font-bold text-[#1A2342]">Konfirmasi Pengajuan Dispensasi</h2>
          <p class="text-xs text-gray-400 mt-0.5">Periksa kembali data sebelum disimpan</p>
        </div>
        <div class="px-6 py-5 space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400 font-medium">Siswa</span>
            <span class="font-semibold text-[#1A2342]">{{ selectedSiswa?.nama }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400 font-medium">NISN</span>
            <span class="font-mono text-slate-600">{{ selectedSiswa?.nisn }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400 font-medium">Kelas</span>
            <!-- PERBAIKAN: pakai namaKelas langsung -->
            <span class="text-slate-600">{{ selectedSiswa?.namaKelas }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400 font-medium">Jenis</span>
            <span class="font-semibold text-[#26A69A]">{{ form.type }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400 font-medium">Periode</span>
            <span class="text-slate-600">{{ formatDate(form.tanggalMulai) }} – {{ formatDate(form.tanggalSelesai) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400 font-medium">Alasan</span>
            <span class="text-slate-600 text-right max-w-[60%]">{{ form.alasan }}</span>
          </div>
          <div v-if="form.buktiDocUrl" class="flex justify-between text-sm">
            <span class="text-gray-400 font-medium">Dokumen</span>
            <span class="text-[#26A69A] text-right max-w-[60%] break-all text-xs">{{ form.buktiDocUrl }}</span>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button @click="showPreviewModal = false" class="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-semibold transition">
            Batal
          </button>
          <button
            @click="submitCreate"
            :disabled="dispensasiStore.isLoading"
            class="px-6 py-2 bg-[#1A2342] text-white rounded-xl text-sm font-bold hover:bg-[#26A69A] transition disabled:opacity-50"
          >
            {{ dispensasiStore.isLoading ? 'Menyimpan...' : 'Konfirmasi & Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal Edit (ATD-09) ── -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100">
          <h2 class="text-lg font-bold text-[#1A2342]">Edit Dispensasi</h2>
          <p class="text-xs text-gray-400 mt-0.5">Perubahan akan langsung tersimpan ke sistem</p>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Siswa <span class="text-gray-400 font-normal">(tidak dapat diubah)</span></label>
            <input
              type="text"
              :value="editTarget?.siswaNama"
              disabled
              class="w-full border border-slate-100 bg-slate-50 rounded-xl px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          <div v-if="editTarget?.statusApproval === 'CLOSED'" class="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <span>⚠</span>
            <span>Dispensasi ini sudah <strong>closed</strong> dan tidak dapat diubah.</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal Mulai <span class="text-red-400">*</span></label>
            <input
              type="date"
              v-model="editForm.tanggalMulai"
              :disabled="editTarget?.statusApproval === 'CLOSED'"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition disabled:bg-slate-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal Selesai <span class="text-red-400">*</span></label>
            <input
              type="date"
              v-model="editForm.tanggalSelesai"
              :disabled="editTarget?.statusApproval === 'CLOSED'"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition disabled:bg-slate-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Alasan <span class="text-red-400">*</span></label>
            <textarea
              v-model="editForm.alasan"
              rows="3"
              :disabled="editTarget?.statusApproval === 'CLOSED'"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition resize-none disabled:bg-slate-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            ></textarea>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Upload Ulang Dokumen <span class="text-gray-400 font-normal">(opsional)</span></label>
            <input
              type="url"
              v-model="editForm.buktiDocUrl"
              placeholder="https://drive.google.com/..."
              :disabled="editTarget?.statusApproval === 'CLOSED'"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition disabled:bg-slate-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
          </div>

          <div v-if="editError" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {{ editError }}
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button @click="showEditModal = false; editError = ''" class="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-semibold transition">
            Batal
          </button>
          <button
            @click="submitEdit"
            :disabled="dispensasiStore.isLoading || editTarget?.statusApproval === 'CLOSED'"
            class="px-6 py-2 bg-[#1A2342] text-white rounded-xl text-sm font-bold hover:bg-[#26A69A] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ dispensasiStore.isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="toast.show"
      class="fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-xl font-semibold text-sm shadow-xl transition-all"
      :class="toast.type === 'success' ? 'bg-[#26A69A] text-white' : 'bg-red-500 text-white'"
    >
      {{ toast.message }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDispensasiStore } from '@/stores/dispensasi'
import { siswaService } from '@/services/siswaService'
import type { Dispensasi } from '@/models/dispensasi'
import type { SiswaResponse } from '@/models/siswa'

const dispensasiStore = useDispensasiStore()

// ── State ──
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const searchQuery = ref('')
const allSiswa = ref<SiswaResponse[]>([])
const selectedSiswa = ref<SiswaResponse | null>(null)

const form = ref({
  type: 'IZIN' as 'DISPENSASI' | 'SAKIT' | 'IZIN',
  tanggalMulai: new Date().toISOString().slice(0, 10),
  tanggalSelesai: new Date().toISOString().slice(0, 10),
  alasan: '',
  buktiDocUrl: ''
})

const formError = ref('')
const showPreviewModal = ref(false)

// Edit modal (ATD-09)
const showEditModal = ref(false)
const editTarget = ref<Dispensasi | null>(null)
const editForm = ref({ tanggalMulai: '', tanggalSelesai: '', alasan: '', buktiDocUrl: '' })
const editError = ref('')

// Toast
const toast = ref({ show: false, message: '', type: 'success' })

// Kalender
const now = new Date()
const bulanKalender = ref(now.getMonth())
const tahunKalender = ref(now.getFullYear())
const hariDipilih = ref(now.getDate())
const hariIni = now.getDate()
const bulanIni = now.getMonth()
const tahunIni = now.getFullYear()
const hariSingkat = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const jenisOptions = [
  { value: 'DISPENSASI', label: 'Dispen' },
  { value: 'SAKIT', label: 'Sakit' },
  { value: 'IZIN', label: 'Izin' },
]

// ── Computed ──
const filteredSiswa = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase()
  return allSiswa.value.filter(
    s => s.nama.toLowerCase().includes(q) || s.nisn?.includes(q)
  )
})

const namabulan = computed(() =>
  new Date(tahunKalender.value, bulanKalender.value).toLocaleString('id-ID', { month: 'long' })
)

const hariKalender = computed(() => {
  const firstDay = new Date(tahunKalender.value, bulanKalender.value, 1).getDay()
  const jumlahHari = new Date(tahunKalender.value, bulanKalender.value + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= jumlahHari; d++) days.push(d)
  return days
})

// ── Methods ──
const fetchSiswa = async () => {
  try {
    const res = await siswaService.getAll()
    // getAll() dari siswaService return response.data langsung (array)
    allSiswa.value = Array.isArray(res) ? res : (res as any).data || []
  } catch {
    allSiswa.value = []
  }
}

const pilihSiswa = (siswa: SiswaResponse) => {
  selectedSiswa.value = siswa
  searchQuery.value = ''
  formError.value = ''
}

const pilihHari = (day: number) => {
  hariDipilih.value = day
}

const prevMonth = () => {
  if (bulanKalender.value === 0) { bulanKalender.value = 11; tahunKalender.value-- }
  else bulanKalender.value--
}

const nextMonth = () => {
  if (bulanKalender.value === 11) { bulanKalender.value = 0; tahunKalender.value++ }
  else bulanKalender.value++
}

// ATD-07: Validasi lalu buka preview modal
const openPreviewModal = () => {
  formError.value = ''
  if (!selectedSiswa.value) { formError.value = 'Pilih siswa terlebih dahulu.'; return }
  if (!form.value.tanggalMulai) { formError.value = 'Tanggal mulai wajib diisi.'; return }
  if (!form.value.tanggalSelesai) { formError.value = 'Tanggal selesai wajib diisi.'; return }
  if (!form.value.alasan.trim()) { formError.value = 'Alasan wajib diisi.'; return }
  showPreviewModal.value = true
}

// ATD-07: Submit create
const submitCreate = async () => {
  try {
    await dispensasiStore.create({
      siswaId: selectedSiswa.value!.id,
      tanggalMulai: form.value.tanggalMulai,
      tanggalSelesai: form.value.tanggalSelesai,
      alasan: form.value.alasan,
      jenis: form.value.type,
      buktiDocUrl: form.value.buktiDocUrl || null
    })
    showPreviewModal.value = false
    showToast('Dispensasi berhasil disimpan!', 'success')
    resetForm()
  } catch (e: any) {
    showPreviewModal.value = false
    showToast(e.response?.data?.message || 'Gagal menyimpan dispensasi', 'error')
  }
}

const resetForm = () => {
  selectedSiswa.value = null
  searchQuery.value = ''
  form.value = {
    type: 'IZIN',
    tanggalMulai: new Date().toISOString().slice(0, 10),
    tanggalSelesai: new Date().toISOString().slice(0, 10),
    alasan: '',
    buktiDocUrl: ''
  }
}

// ATD-09: Buka edit modal
const openEditModal = (item: Dispensasi) => {
  editTarget.value = item
  editForm.value = {
    tanggalMulai: item.tanggalMulai,
    tanggalSelesai: item.tanggalSelesai,
    alasan: item.alasan,
    buktiDocUrl: item.buktiDocUrl || ''
  }
  editError.value = ''
  showEditModal.value = true
}

// ATD-09: Submit update
const submitEdit = async () => {
  editError.value = ''
  if (!editForm.value.tanggalMulai || !editForm.value.tanggalSelesai || !editForm.value.alasan.trim()) {
    editError.value = 'Tanggal mulai, tanggal selesai, dan alasan wajib diisi.'
    return
  }
  try {
    await dispensasiStore.update(editTarget.value!.id, {
      tanggalMulai: editForm.value.tanggalMulai,
      tanggalSelesai: editForm.value.tanggalSelesai,
      alasan: editForm.value.alasan,
      buktiDocUrl: editForm.value.buktiDocUrl || null,
    })
    showEditModal.value = false
    showToast('Dispensasi berhasil diupdate!', 'success')
  } catch (e: any) {
    editError.value = e.response?.data?.message || 'Gagal mengupdate dispensasi'
  }
}

// Update status dispensasi
const handleUpdateStatus = async (id: number, status: string) => {
  if (!status) return
  try {
    await dispensasiStore.updateStatus(id, status)
    showToast(`Status berhasil diubah ke ${status}`, 'success')
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Gagal mengubah status', 'error')
  }
}

// Helpers
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const badgeClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING:  'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600',
    CLOSED:   'bg-slate-100 text-slate-400',
  }
  return map[status] || 'bg-slate-100 text-slate-400'
}

const jenisBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    DISPENSASI: 'bg-blue-100 text-blue-600',
    SAKIT:      'bg-yellow-100 text-yellow-600',
    IZIN:       'bg-green-100 text-green-600',
  }
  return map[status] || 'bg-slate-100 text-slate-400'
}

const jenisLabel = (status: string) => {
  return { DISPENSASI: 'Dispen', SAKIT: 'Sakit', IZIN: 'Izin' }[status] || status
}

const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// ── Lifecycle ──
onMounted(async () => {
  await Promise.all([
    fetchSiswa(),
    dispensasiStore.fetchAll(),
    dispensasiStore.fetchToday()
  ])
})
</script>