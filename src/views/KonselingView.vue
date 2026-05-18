<template>
  <div class="p-6 bg-slate-50 min-h-screen">

    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#1A2342]">Konseling Siswa</h1>
        <p class="text-sm text-gray-400 mt-1">Manajemen jadwal dan riwayat konseling</p>
      </div>
      <div class="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <span class="text-gray-400 text-sm font-medium">Bulan</span>
        <input
          type="month"
          v-model="selectedMonth"
          class="outline-none text-gray-700 bg-transparent cursor-pointer font-semibold"
        />
      </div>
      <button
        v-if="canManageKonseling"
        @click="openCreateModal()"
        class="px-5 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center gap-2 bg-[#1A2342] hover:bg-[#2e3b66]"
      >
        <span>+</span> Buat Konseling Mandiri
      </button>
    </div>

    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="activeTab === tab.key
          ? 'bg-[#1A2342] text-white shadow-lg'
          : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'"
        class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'wajib'">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 class="font-bold text-[#1A2342]">Siswa Wajib Konseling</h2>
          <span class="text-xs text-gray-400">{{ wajibList.length }} siswa</span>
        </div>

        <div v-if="isLoadingWajib" class="p-12 text-center text-gray-400 text-sm animate-pulse">
          Memuat data...
        </div>

        <div v-else-if="!hasWajibData" class="p-12 text-center text-gray-400 text-sm">
          <div class="mb-2 text-3xl">✅</div>
          Tidak ada siswa wajib konseling pada periode ini
        </div>

        <table v-else class="w-full text-left">
          <thead class="bg-[#1A2342] text-white">
            <tr>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Siswa</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">NISN</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Kelas</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Total Terlambat</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Total Alpha</th>
              <th v-if="canManageKonseling" class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in wajibList" :key="item.studentId" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4">
                <p class="font-semibold text-slate-700 text-sm">{{ item.name }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500 font-mono">{{ item.nisn }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ item.kelas }}</td>
              <td class="px-6 py-4 text-center">
                <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">
                  {{ item.totalLate }}x
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black">
                  {{ item.totalAlpha }}x
                </span>
              </td>
              <td v-if="canManageKonseling" class="px-6 py-4 text-center">
                <button
                  @click="openCreateModal(item)"
                  class="px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm bg-[#26A69A] hover:bg-[#1f8a7f] text-white"
                >
                  Buat Jadwal
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'riwayat'">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-[#1A2342]">Riwayat Konseling</h2>
            <span class="text-xs text-gray-400">{{ filteredRiwayatList.length }} data</span>
          </div>

          <div class="flex flex-wrap items-end gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <!-- Filter Siswa (Joined in one row) -->
            <div class="flex-1 min-w-[300px] relative">
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cari nama siswa</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  v-model="historySearchQuery"
                  type="text"
                  @focus="handleHistorySearchFocus"
                  @blur="handleHistorySearchBlur"
                  placeholder="Ketik nama atau NISN siswa..."
                  class="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
                />
                <button
                  v-if="historySearchQuery"
                  @click="historySearchQuery = ''"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <!-- Dropdown Riwayat -->
              <div v-if="isHistorySearchFocused && filteredSiswaHistory.length > 0" class="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg">
                <div
                  v-for="siswa in filteredSiswaHistory"
                  :key="siswa.id"
                  @mousedown="handleSelectHistorySiswa(siswa)"
                  class="flex items-center justify-between px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                >
                  <div>
                    <p class="text-sm font-semibold text-[#1A2342]">{{ siswa.nama }}</p>
                    <p class="text-xs text-gray-400 font-mono">{{ siswa.nisn }}</p>
                  </div>
                  <span class="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-medium">{{ siswa.namaKelas }}</span>
                </div>
              </div>

              <!-- Selected Student Badge -->
              <div v-if="selectedHistorySiswaData" class="mt-2 flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-4 py-2 animate-in fade-in slide-in-from-top-1">
                <div>
                  <p class="text-sm font-bold text-[#1A2342]">{{ selectedHistorySiswaData.nama }}</p>
                  <p class="text-xs text-gray-500 font-mono">{{ selectedHistorySiswaData.nisn }} · {{ selectedHistorySiswaData.namaKelas }}</p>
                </div>
                <button @click="clearHistoryFilter" class="text-xs text-red-400 hover:text-red-600 font-bold uppercase tracking-wider">Ganti</button>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dari</label>
              <input type="date" v-model="filterStartDate" class="text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#26A69A]" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sampai</label>
              <input type="date" v-model="filterEndDate" class="text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#26A69A]" />
            </div>
            <button @click="handleFilterRiwayat" class="bg-[#1A2342] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm h-[38px]">
              Filter
            </button>
          </div>
        </div>

        <div v-if="isLoadingRiwayat" class="p-12 text-center text-gray-400 text-sm animate-pulse">
          Memuat data...
        </div>

        <div v-else-if="filteredRiwayatList.length === 0" class="p-12 text-center text-gray-400 text-sm">
          <div class="mb-2 text-3xl">📋</div>
          Tidak ada data riwayat yang sesuai
        </div>

        <table v-else class="w-full text-left">
          <thead class="bg-[#1A2342] text-white">
            <tr>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Siswa</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Tanggal</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Topik</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">Jenis Pelanggaran</th>
              <th class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Status</th>
              <th v-if="canManageKonseling" class="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider text-center">Aksi</th>
              <th v-if="canManageKonseling" class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filteredRiwayatList" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4">
                <p class="font-semibold text-slate-700 text-sm">{{ item.siswaNama }}</p>
                <p class="text-xs text-gray-400 font-mono">{{ item.siswaNisn }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ formatDate(item.date) }}</td>
              <td class="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate" :title="item.topic">{{ item.topic }}</td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ item.jenisPelanggaran || '-' }}</td>
              <td class="px-6 py-4 text-center">
                <span :class="statusBadgeClass(item.status)" class="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td v-if="canManageKonseling" class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    v-if="item.status !== 'SELESAI'"
                    @click="openEditModal(item)"
                    class="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24 " stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    v-if="item.status !== 'SELESAI'"
                    @click="handleDeleteClick(item.id)"
                    class="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <span v-else class="text-xs text-slate-400 font-medium italic">Terkunci</span>
                </div>
              </td>
              <td v-if="canManageKonseling" class="px-6 py-4 text-right">
                <button
                  v-if="item.status !== 'SELESAI'"
                  @click="goCatat(item.id)"
                  class="bg-[#26A69A] hover:bg-[#1f8a7f] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm whitespace-nowrap"
                >
                  Catat Hasil
                </button>
                <span v-else class="text-[10px] bg-slate-100 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Final</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100">
          <h2 class="text-lg font-bold text-[#1A2342]">Buat Jadwal Konseling</h2>
          <p class="text-xs text-gray-400 mt-0.5">Isi detail jadwal konseling untuk siswa ini</p>
        </div>
        <div class="px-6 py-5 space-y-4">

          <div class="space-y-1">
            <div v-if="!createTarget" class="relative">
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Cari Siswa <span class="text-red-400">*</span></label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Ketik nama atau NISN siswa..."
                  class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              </div>

              <div v-if="searchQuery && filteredSiswa.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                <div
                  v-for="siswa in filteredSiswa"
                  :key="siswa.id"
                  @click="pilihSiswaForm(siswa)"
                  class="px-4 py-2.5 hover:bg-teal-50 cursor-pointer text-sm border-b border-slate-100 last:border-b-0 flex justify-between items-center transition-colors"
                >
                  <div>
                    <p class="font-semibold text-[#1A2342]">{{ siswa.nama }}</p>
                    <p class="text-xs text-gray-400 font-mono">{{ siswa.nisn }}</p>
                  </div>
                  <span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">{{ siswa.namaKelas }}</span>
                </div>
              </div>

              <div v-if="searchQuery && filteredSiswa.length === 0" class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl p-3 text-center text-xs text-gray-400 shadow-lg">
                Siswa tidak ditemukan
              </div>
            </div>

            <div v-else class="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex justify-between items-center">
              <div>
                <p class="text-sm font-bold text-[#1A2342]">{{ createTarget?.name }}</p>
                <p class="text-xs text-gray-500 font-mono">{{ createTarget?.nisn }} · {{ createTarget?.kelas }}</p>
              </div>
              <button
                v-if="createTarget.totalLate === 0"
                type="button"
                @click="createTarget = null"
                class="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider transition-colors"
              >
                Ganti
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal <span class="text-red-400">*</span></label>
            <input
              type="date"
              v-model="createForm.date"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Topik <span class="text-red-400">*</span></label>
            <input
              type="text"
              v-model="createForm.topic"
              placeholder="contoh: Keterlambatan berulang"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Jenis Pelanggaran</label>
            <input
              type="text"
              v-model="createForm.violationType"
              placeholder="contoh: TERLAMBAT"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Catatan Awal</label>
            <textarea
              v-model="createForm.initialNotes"
              rows="3"
              placeholder="Catatan awal konseling..."
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition resize-none"
            ></textarea>
          </div>

          <div v-if="createError" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {{ createError }}
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button @click="closeCreateModal" type="button" class="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-semibold transition">
            Batal
          </button>
          <button
            @click="submitCreate"
            type="button"
            :disabled="isSubmitting || !createTarget"
            :class="(!isSubmitting && createTarget) ? 'bg-[#1A2342] hover:bg-[#26A69A]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
            class="px-6 py-2 text-white rounded-xl text-sm font-bold transition shadow-sm"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100">
          <h2 class="text-lg font-bold text-[#1A2342]">Edit Jadwal Konseling</h2>
          <p class="text-xs text-gray-400 mt-0.5">Perbarui detail jadwal konseling</p>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <p class="text-sm font-bold text-[#1A2342]">{{ editTarget?.siswaNama }}</p>
            <p class="text-xs text-gray-500 font-mono">{{ editTarget?.siswaNisn }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal</label>
            <input
              type="date"
              v-model="editForm.date"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Topik</label>
            <input
              type="text"
              v-model="editForm.topic"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Jenis Pelanggaran</label>
            <input
              type="text"
              v-model="editForm.violationType"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Catatan Awal</label>
            <textarea
              v-model="editForm.initialNotes"
              rows="3"
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition resize-none"
            ></textarea>
          </div>

          <div v-if="editError" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {{ editError }}
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button @click="closeEditModal" class="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-semibold transition">
            Batal
          </button>
          <button
            @click="submitEdit"
            class="px-6 py-2 bg-[#1A2342] text-white rounded-xl text-sm font-bold hover:bg-[#26A69A] transition"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>

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
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useKonselingStore } from '@/stores/konseling'

// ── Local Component View Tabs ──
const tabs = [
  { key: 'wajib', label: 'Wajib Konseling' },
  { key: 'riwayat', label: 'Riwayat Konseling' },
]
const activeTab = ref('wajib')

const router = useRouter()

// ── Inisialisasi Pinia Store ──
const konselingStore = useKonselingStore()

// Menghubungkan ref template dengan global reactive state di Pinia Store
const {
  selectedMonth,
  wajibList,
  isLoadingWajib,
  riwayatList,
  isLoadingRiwayat,
  filterStudentId,
  filterStartDate,
  filterEndDate,
  showCreateModal,
  createTarget,
  createForm,
  createError,
  isSubmitting,
  showEditModal,
  editTarget,
  editForm,
  editError,
  toast,
  hasWajibData,
  hasRiwayatData,
  canManageKonseling,
  searchQuery,
  filteredSiswa,
  historySearchQuery,
  filteredSiswaHistory,
  selectedHistorySiswaData,
  filteredRiwayatList,
} = storeToRefs(konselingStore)

// Memanggil Action/Method terpusat dari Pinia Store
const {
  fetchWajibKonseling,
  fetchRiwayatKonseling,
  openCreateModal,
  closeCreateModal,
  submitCreate,
  openEditModal,
  closeEditModal,
  submitEdit,
  removeKonseling,
  pilihSiswaForm,
  fetchAllSiswa,
  selectHistorySiswa,
  clearHistoryFilter,
} = konselingStore

// ── Search History Local State ──
const isHistorySearchFocused = ref(false)

const handleHistorySearchFocus = () => {
  fetchAllSiswa()
  isHistorySearchFocused.value = true
}

const handleHistorySearchBlur = () => {
  setTimeout(() => {
    isHistorySearchFocused.value = false
  }, 200)
}

const handleSelectHistorySiswa = (siswa: any) => {
  selectHistorySiswa(siswa)
  isHistorySearchFocused.value = false
}

// ── Action Handlers ──
const handleFilterRiwayat = () => {
  fetchRiwayatKonseling(
    filterStudentId.value ?? undefined,
    filterStartDate.value || undefined,
    filterEndDate.value || undefined
  )
}

const handleDeleteClick = (id: number) => {
  if (confirm('Hapus jadwal konseling ini? Data akan masuk ke sistem soft delete.')) {
    removeKonseling(id)
  }
}

const goCatat = (id: number) => {
  router.push({ name: 'catat-hasil-konseling', params: { id: String(id) } })
}

// ── Visual Helpers (Lokal) ──
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'text-yellow-600 border-yellow-200 bg-yellow-50',
    SELESAI: 'text-green-600 border-green-200 bg-green-50',
    PERLU_MONITORING: 'text-orange-600 border-orange-200 bg-orange-50',
  }
  return map[status] || 'text-slate-500 border-slate-200 bg-slate-50'
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    SELESAI: 'Selesai',
    PERLU_MONITORING: 'Perlu Monitor',
  }
  return map[status] || status
}

// ── Watchers & Side Effects ──
watch(selectedMonth, (newMonth) => {
  fetchWajibKonseling(newMonth)
})

watch(activeTab, (tab) => {
  if (tab === 'riwayat') {
    handleFilterRiwayat()
  }
})

// ── Lifecycle Hooks ──
onMounted(() => {
  fetchWajibKonseling(selectedMonth.value)
})
</script>
