<template>
  <div class="p-6 bg-slate-50 min-h-screen text-left">

    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#1A2342]">Dispensasi & Izin Siswa</h1>
        <p class="text-sm text-gray-400 mt-1">Pencatatan izin dan dispensasi harian</p>
      </div>
      <div class="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <span class="text-gray-400 text-sm font-medium">Tanggal Operasional</span>
        <input
          type="date"
          v-model="selectedDate"
          class="outline-none text-gray-700 bg-transparent cursor-pointer font-semibold text-sm"
        />
      </div>
    </div>

    <div class="flex flex-col xl:flex-row gap-6">

      <div class="flex-1 flex flex-col gap-6">

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

          <div v-if="searchQuery && filteredSiswa.length > 0" class="mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-white z-20">
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
              <span class="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-medium">{{ siswa.namaKelas }}</span>
            </div>
          </div>

          <div v-if="searchQuery && filteredSiswa.length === 0" class="mt-2 px-4 py-3 text-sm text-gray-400 text-center border border-slate-200 rounded-xl">
            Siswa tidak ditemukan
          </div>

          <div v-if="selectedSiswa" class="mt-3 flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
            <div>
              <p class="text-sm font-bold text-[#1A2342]">{{ selectedSiswa.nama }}</p>
              <p class="text-xs text-gray-500 font-mono">{{ selectedSiswa.nisn }} · {{ selectedSiswa.namaKelas }}</p>
            </div>
            <button @click="selectedSiswa = null; searchQuery = ''" class="text-xs text-red-400 hover:text-red-600 font-medium font-bold">Ganti</button>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Detail Dispensasi</label>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal Mulai <span class="text-red-400">*</span></label>
              <input
                type="date"
                v-model="form.tanggalMulai"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal Selesai <span class="text-red-400">*</span></label>
              <input
                type="date"
                v-model="form.tanggalSelesai"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-xs font-semibold text-gray-500 mb-2">Jenis Keterangan <span class="text-red-400">*</span></label>
            <div class="flex gap-3">
              <label
                v-for="opt in jenisOptions"
                :key="opt.value"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer font-bold text-xs uppercase tracking-wider transition-all"
                :class="form.type === opt.value
                  ? 'border-[#26A69A] bg-teal-50 text-[#26A69A]'
                  : 'border-slate-100 text-slate-400 hover:border-slate-200'"
              >
                <input type="radio" v-model="form.type" :value="opt.value" class="hidden" />
                {{ opt.label }}
              </label>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Alasan <span class="text-red-400">*</span></label>
            <textarea
              v-model="form.alasan"
              rows="3"
              placeholder="Tuliskan alasan dispensasi..."
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition resize-none bg-gray-50"
            ></textarea>
          </div>

          <div class="mt-4">
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Link Dokumen Pendukung <span class="text-gray-400 font-normal">(opsional)</span></label>
            <input
              type="url"
              v-model="form.buktiDocUrl"
              placeholder="https://drive.google.com/..."
              class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition"
            />
          </div>

          <div v-if="formError" class="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-bold">
            {{ formError }}
          </div>
        </div>

        <div class="flex justify-end">
          <button
            @click="openPreviewModal"
            :disabled="dispensasiStore.isLoading"
            class="px-8 py-3 bg-[#1A2342] rounded-xl font-bold text-white hover:bg-[#26A69A] shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ dispensasiStore.isLoading ? 'Menyimpan...' : 'Simpan Dispensasi' }}
          </button>
        </div>

        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-bold text-[#1A2342]">Riwayat Izin & Dispensasi</h2>
              <span class="text-xs text-gray-400 font-semibold">{{ dispensasiStore.dispensasiList?.length || 0 }} data</span>
            </div>

            <div class="flex flex-wrap items-end gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div class="flex-1 min-w-[150px]">
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filter Siswa</label>
                <select v-model="filterSiswaId" class="w-full text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#26A69A] font-semibold text-slate-700">
                  <option :value="null">Semua Siswa</option>
                  <option v-for="s in allSiswa" :key="s.id" :value="s.id">{{ s.nama }} - {{ s.namaKelas }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dari</label>
                <input type="date" v-model="filterStartDate" class="text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#26A69A] font-medium text-slate-700" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sampai</label>
                <input type="date" v-model="filterEndDate" class="text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#26A69A] font-medium text-slate-700" />
              </div>
              <button @click="fetchRiwayat" class="bg-[#1A2342] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm h-[38px]">
                Filter
              </button>
            </div>
          </div>

          <div v-if="isLoadingRiwayat" class="p-12 text-center text-gray-400 text-sm animate-pulse font-medium">
            Memuat data...
          </div>

          <table v-else class="w-full text-left">
            <thead class="bg-[#1A2342] text-white text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Siswa</th>
                <th class="px-6 py-4">Periode</th>
                <th class="px-6 py-4">Alasan</th>
                <th class="px-6 py-4 text-center">Jenis</th>
                <th class="px-6 py-4 text-center">Status</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="riwayatData.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-400 text-sm font-medium">Tidak ada data dispensasi pada periode ini</td>
              </tr>
              <tr v-for="item in riwayatData" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-6 py-4">
                  <p class="font-bold text-slate-700 text-sm">{{ item.siswaNama }}</p>
                  <p class="text-xs text-gray-400 font-mono mt-0.5">{{ item.siswaNisn }}</p>
                </td>
                <td class="px-6 py-4 text-xs text-slate-600 font-semibold leading-relaxed">
                  {{ formatDate(item.tanggalMulai) }} <br><span class="text-gray-400 font-normal">s/d</span> <br> {{ formatDate(item.tanggalSelesai) }}
                </td>
                <td class="px-6 py-4 max-w-[200px]">
                  <div v-if="item.buktiDocUrl" class="mb-1 text-left">
                    <a :href="item.buktiDocUrl" target="_blank" class="inline-flex items-center gap-1 text-[9px] font-black text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" /></svg>
                      Dokumen
                    </a>
                  </div>
                  <p class="text-xs text-slate-500 truncate" :title="item.alasan">{{ item.alasan }}</p>
                </td>

                <td class="px-6 py-4 text-center">
                  <span
                    :class="{
                      'bg-blue-100 text-blue-600':     item.jenis === 'DISPENSASI',
                      'bg-yellow-100 text-yellow-600': item.jenis === 'SAKIT',
                      'bg-green-100 text-green-600':   item.jenis === 'IZIN',
                    }"
                    class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"
                  >
                    {{ item.jenis === 'DISPENSASI' ? 'Dispen' : item.jenis === 'SAKIT' ? 'Sakit' : 'Izin' }}
                  </span>
                </td>

                <td class="px-6 py-4 text-center">
                  <span :class="badgeClass(item.statusApproval)" class="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border">
                    {{ item.statusApproval }}
                  </span>
                </td>

                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      v-if="item.statusApproval !== 'CLOSED'"
                      @click="openEditModal(item)"
                      class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <select
                      v-if="item.statusApproval !== 'CLOSED'"
                      @change="handleUpdateStatus(item.id, ($event.target as HTMLSelectElement).value)"
                      :value="item.statusApproval"
                      class="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#26A69A] cursor-pointer font-bold"
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

                    <span v-if="item.statusApproval === 'CLOSED'" class="text-xs text-gray-300 font-bold select-none">Closed</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="xl:w-72 flex flex-col gap-6">

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4 select-none">
            <button @click="prevMonth" class="text-gray-400 hover:text-[#26A69A] text-lg font-black transition">‹</button>
            <span class="text-sm font-black text-[#1A2342]">{{ namabulan }} {{ tahunKalender }}</span>
            <button @click="nextMonth" class="text-gray-400 hover:text-[#26A69A] text-lg font-black transition">›</button>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center select-none font-inter">
            <div v-for="h in hariSingkat" :key="h" class="text-[10px] font-bold text-gray-400 py-1">{{ h }}</div>
            <div v-for="(day, idx) in hariKalender" :key="idx"
              class="py-1.5 text-xs rounded-lg transition-all"
              :class="{
              'invisible': !day,
              'bg-[#26A69A] text-white font-black shadow-lg shadow-teal-100 cursor-default': day === hariIni && bulanKalender === bulanIni && tahunKalender === tahunIni,
              'text-slate-400 font-semibold cursor-not-allowed': day && !(day === hariIni && bulanKalender === bulanIni && tahunKalender === tahunIni)
            }"
            >
              {{ day || '' }}
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex-1 min-h-[300px]">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Izin Aktif Hari Ini: {{ formatDate(hariIniTanggalMurni) }}
          </h3>

          <div v-if="izinAktifHariIniMurni.length === 0" class="py-12 text-center text-gray-400 text-xs font-medium leading-relaxed">
            <div class="text-3xl mb-2.5">📅</div>
            Tidak ada siswa izin/dispensasi<br>aktif pada hari ini.
          </div>

          <div v-else class="space-y-3 max-h-[350px] overflow-y-auto pr-1 text-left">
            <div
              v-for="item in izinAktifHariIniMurni"
              :key="item.id"
              class="flex items-center justify-between py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors px-2 rounded-lg"
            >
              <div class="text-left">
                <p class="text-sm font-bold text-[#1A2342] truncate max-w-[140px]">{{ item.siswaNama }}</p>
                <p class="text-[10px] text-gray-400 font-mono mt-0.5">{{ item.siswaNisn }}</p>
              </div>
              <span
                :class="{
                  'bg-blue-100 text-blue-600': item.jenis === 'DISPENSASI',
                  'bg-yellow-100 text-yellow-600': item.jenis === 'SAKIT',
                  'bg-green-100 text-green-600': item.jenis === 'IZIN',
                }"
                class="text-[9px] font-black px-2.5 py-0.5 rounded uppercase tracking-wide"
              >
                {{ item.jenis === 'DISPENSASI' ? 'Dispen' : item.jenis === 'SAKIT' ? 'Sakit' : 'Izin' }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

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
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button @click="showPreviewModal = false" class="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-semibold transition">Batal</button>
          <button @click="submitCreate" :disabled="dispensasiStore.isLoading" class="px-6 py-2 bg-[#1A2342] text-white rounded-xl text-sm font-bold hover:bg-[#26A69A] transition disabled:opacity-50">Konfirmasi & Simpan</button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100">
          <h2 class="text-lg font-bold text-[#1A2342]">Edit Dispensasi</h2>
          <p class="text-xs text-gray-400 mt-0.5">Perubahan akan langsung tersimpan ke sistem</p>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Siswa</label>
            <input type="text" :value="editTarget?.siswaNama" disabled class="w-full border border-slate-100 bg-slate-50 rounded-xl px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal Mulai <span class="text-red-400">*</span></label>
            <input type="date" v-model="editForm.tanggalMulai" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A]" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal Selesai <span class="text-red-400">*</span></label>
            <input type="date" v-model="editForm.tanggalSelesai" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A]" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Alasan <span class="text-red-400">*</span></label>
            <textarea v-model="editForm.alasan" rows="3" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] resize-none"></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Upload Ulang Dokumen</label>
            <input type="url" v-model="editForm.buktiDocUrl" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A]" />
          </div>
          <div v-if="editError" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-bold">{{ editError }}</div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button @click="showEditModal = false; editError = ''" class="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-semibold transition">Batal</button>
          <button @click="submitEdit" :disabled="dispensasiStore.isLoading" class="px-6 py-2 bg-[#1A2342] text-white rounded-xl text-sm font-bold hover:bg-[#26A69A] transition">Simpan Perubahan</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDispensasiStore } from '@/stores/dispensasi'
import { siswaService } from '@/services/siswaService'
import api from '@/services/api'
import type { Dispensasi } from '@/models/dispensasi'
import type { SiswaResponse } from '@/models/siswa'

const dispensasiStore = useDispensasiStore()

// ── State Data Master ──
const allSiswa = ref<SiswaResponse[]>([])
const selectedSiswa = ref<SiswaResponse | null>(null)
const searchQuery = ref('')
const selectedDate = ref(new Date().toISOString().slice(0, 10))

// ── State Riwayat Table (Rentang Waktu Awal Bulan s/d Hari Ini) ──
const nowTime = new Date()
const todayStr = nowTime.toISOString().slice(0, 10)
const firstDayStr = new Date(nowTime.getFullYear(), nowTime.getMonth(), 1).toISOString().slice(0, 10)

const filterStartDate = ref(firstDayStr)
const filterEndDate = ref(todayStr)
const filterSiswaId = ref<number | null>(null)
const riwayatData = ref<Dispensasi[]>([])
const isLoadingRiwayat = ref(false)

// ── State Form Create ──
const form = ref({
  type: 'IZIN' as 'DISPENSASI' | 'SAKIT' | 'IZIN',
  tanggalMulai: todayStr,
  tanggalSelesai: todayStr,
  alasan: '',
  buktiDocUrl: ''
})
const formError = ref('')
const showPreviewModal = ref(false)

// ── State Form Edit ──
const showEditModal = ref(false)
const editTarget = ref<Dispensasi | null>(null)
const editForm = ref({ tanggalMulai: '', tanggalSelesai: '', alasan: '', buktiDocUrl: '' })
const editError = ref('')

const toast = ref({ show: false, message: '', type: 'success' })

// ── State Kalender ──
const bulanKalender = ref(nowTime.getMonth())
const tahunKalender = ref(nowTime.getFullYear())
const hariIni = nowTime.getDate()
const bulanIni = nowTime.getMonth()
const tahunIni = nowTime.getFullYear()
const hariSingkat = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// FIX MUTLAK: String tanggal murni hari ini (2026-06-06) agar list kanan terisolasi total
const hariIniTanggalMurni = computed(() => {
  const yyyy = nowTime.getFullYear()
  const mm = String(nowTime.getMonth() + 1).padStart(2, '0')
  const dd = String(nowTime.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
})

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
    s => (s.nama?.toLowerCase().includes(q) || s.nisn?.includes(q))
  )
})

const namabulan = computed(() => new Date(tahunKalender.value, bulanKalender.value).toLocaleString('id-ID', { month: 'long' }))

const hariKalender = computed(() => {
  const firstDay = new Date(tahunKalender.value, bulanKalender.value, 1).getDay()
  const jumlahHari = new Date(tahunKalender.value, bulanKalender.value + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= jumlahHari; d++) days.push(d)
  return days
})

// FIX INTEGRITAS FILTER: Membongkar data array murni store dan mengecek rentang aktif khusus HARI INI saja
const izinAktifHariIniMurni = computed(() => {
  const target = hariIniTanggalMurni.value // Mengunci target murni hari ini
  const rawList = dispensasiStore.dispensasiList

  let listValid = []
  if (Array.isArray(rawList)) {
    listValid = rawList
  } else if (rawList && typeof rawList === 'object') {
    listValid = (rawList as any).data?.data || (rawList as any).data || []
  }

  return listValid.filter((item: any) => {
    if (!item.tanggalMulai || !item.tanggalSelesai) return false

    // Hanya tampilkan status APPROVED (atau PENDING jika ingin ikut terpantau langsung)
    const cocokStatus = item.statusApproval === 'APPROVED'

    // Potong substring murni 10 karakter pertama (YYYY-MM-DD) dari database
    const tglMulai = item.tanggalMulai.substring(0, 10)
    const tglSelesai = item.tanggalSelesai.substring(0, 10)

    const dalamRentangTanggal = target >= tglMulai && target <= tglSelesai
    return cocokStatus && dalamRentangTanggal
  })
})

// ── Methods Fetching ──
const fetchSiswa = async () => {
  try {
    const res = await siswaService.getAll()
    allSiswa.value = Array.isArray(res) ? res : (res as any).data || []
  } catch {
    allSiswa.value = []
  }
}

const fetchRiwayat = async () => {
  isLoadingRiwayat.value = true
  try {
    const params: any = { startDate: filterStartDate.value, endDate: filterEndDate.value }
    if (filterSiswaId.value) params.siswaId = filterSiswaId.value

    const res = await api.get('/dispensasi', { params })
    riwayatData.value = res.data.data || res.data || []
  } catch (error) {
    console.error('Gagal mengambil riwayat', error)
  } finally {
    isLoadingRiwayat.value = false
  }
}

// ── Methods Form Actions ──
const pilihSiswa = (siswa: SiswaResponse) => {
  selectedSiswa.value = siswa
  searchQuery.value = ''
  formError.value = ''
}

const openPreviewModal = () => {
  formError.value = ''
  if (!selectedSiswa.value) { formError.value = 'Pilih siswa terlebih dahulu.'; return }
  if (!form.value.tanggalMulai || !form.value.tanggalSelesai) { formError.value = 'Tanggal wajib diisi.'; return }
  if (form.value.tanggalSelesai < form.value.tanggalMulai) { formError.value = 'Tanggal selesai tidak boleh mendahului tanggal mulai.'; return }
  if (!form.value.alasan.trim()) { formError.value = 'Alasan wajib diisi.'; return }
  showPreviewModal.value = true
}

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
    showToast('Dispensasi berhasil diajukan!', 'success')
    resetForm()

    fetchRiwayat()
    dispensasiStore.fetchAll() // Refresh data list store secara asinkron
  } catch (e: any) {
    showPreviewModal.value = false
    showToast(e.response?.data?.message || 'Gagal menyimpan dispensasi', 'error')
  }
}

const resetForm = () => {
  selectedSiswa.value = null
  searchQuery.value = ''
  form.value = { type: 'IZIN', tanggalMulai: todayStr, tanggalSelesai: todayStr, alasan: '', buktiDocUrl: '' }
}

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

const submitEdit = async () => {
  editError.value = ''
  if (!editForm.value.tanggalMulai || !editForm.value.tanggalSelesai || !editForm.value.alasan.trim()) {
    editError.value = 'Semua field dengan bintang merah wajib diisi.'
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
    showToast('Dispensasi berhasil diperbarui!', 'success')

    fetchRiwayat()
    dispensasiStore.fetchAll()
  } catch (e: any) {
    editError.value = e.response?.data?.message || 'Gagal mengupdate data'
  }
}

const handleUpdateStatus = async (id: number, status: string) => {
  if (!status) return
  try {
    await dispensasiStore.updateStatus(id, status)
    showToast(`Status berhasil diubah ke ${status}`, 'success')
    fetchRiwayat()
    dispensasiStore.fetchAll() // Pemicu pembaruan list kanan otomatis setelah approve diubah
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Gagal mengubah status', 'error')
  }
}

const prevMonth = () => {
  if (bulanKalender.value === 0) { bulanKalender.value = 11; tahunKalender.value-- }
  else bulanKalender.value--
}

const nextMonth = () => {
  if (bulanKalender.value === 11) { bulanKalender.value = 0; tahunKalender.value++ }
  else bulanKalender.value++
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const badgeClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING:  'text-yellow-600 border-yellow-200 bg-yellow-50',
    APPROVED: 'text-green-600 border-green-200 bg-green-50',
    REJECTED: 'text-red-600 border-red-200 bg-red-50',
    CLOSED:   'text-slate-500 border-slate-200 bg-slate-50',
  }
  return map[status] || 'text-slate-500 border-slate-200'
}

const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

onMounted(async () => {
  isLoadingRiwayat.value = true
  try {
    await Promise.all([
      fetchSiswa(),
      dispensasiStore.fetchAll(),
      fetchRiwayat()
    ])
  } catch (error) {
    console.error("Initialization error:", error)
  } finally {
    isLoadingRiwayat.value = false
  }
})
</script>

<style scoped>
.font-inter { font-family: 'Inter', sans-serif; }
</style>
