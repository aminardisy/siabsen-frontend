<template>
  <div class="p-6 bg-slate-50 min-h-screen font-inter">

    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-left">
      <div>
        <h1 class="text-2xl font-bold text-[#1A2342]">Konseling Siswa</h1>
        <p class="text-sm text-gray-400 mt-1">Manajemen jadwal dan riwayat konseling bimbingan konseling</p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">

        <div v-if="activeTab === 'wajib'" class="relative animate-in fade-in duration-200">
          <button
            @click="isMonthPickerOpen = !isMonthPickerOpen"
            type="button"
            class="flex items-center gap-3 bg-white px-4 h-12 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition font-bold text-sm text-slate-700 w-full sm:w-auto justify-between"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#26A69A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formatSelectedMonthLabel }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isMonthPickerOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div v-if="isMonthPickerOpen" class="absolute right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50 w-64 animate-in fade-in slide-in-from-top-2 duration-150 text-center">
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <button @click="currentPickerYear--" type="button" class="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#1A2342] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span class="font-black text-sm text-[#1A2342] font-mono">{{ currentPickerYear }}</span>
              <button @click="currentPickerYear++" type="button" class="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#1A2342] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="(mName, index) in monthNamesShort"
                :key="index"
                type="button"
                @click="selectMonthAndYear(index)"
                :class="[
                  'py-2 text-xs font-bold rounded-xl transition-all duration-150',
                  isCurrentSelected(index)
                    ? 'bg-[#26A69A] text-white shadow-md shadow-teal-100/50'
                    : 'text-slate-600 hover:bg-slate-50'
                ]"
              >
                {{ mName }}
              </button>
            </div>
          </div>
        </div>

        <button
          v-if="canManageKonseling"
          @click="openCreateModal()"
          class="px-5 h-12 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 bg-[#1A2342] hover:bg-[#2e3b66] active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Buat Jadwal Mandiri
        </button>
      </div>
    </div>

    <div class="flex gap-2 mb-6 text-left">
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

    <div v-if="activeTab === 'wajib'" class="text-left animate-in fade-in duration-150">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 class="font-bold text-[#1A2342]">Siswa Wajib Konseling</h2>
          <span class="text-xs text-gray-400 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">{{ wajibList.length }} Siswa</span>
        </div>

        <div v-if="isLoadingWajib" class="p-12 text-center text-gray-400 text-sm animate-pulse">
          Memuat data wajib konseling...
        </div>

        <div v-else-if="!hasWajibData" class="p-12 text-center text-gray-400 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-teal-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tidak ada siswa wajib konseling pada periode ini. Target kehadiran terpenuhi!
        </div>

        <table v-else class="w-full text-left">
          <thead class="bg-[#1A2342] text-white text-xs uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4 font-semibold text-[10px]">Siswa</th>
              <th class="px-6 py-4 font-semibold text-[10px]">NISN</th>
              <th class="px-6 py-4 font-semibold text-[10px]">Kelas</th>
              <th class="px-6 py-4 font-semibold text-[10px] text-center">Total Terlambat</th>
              <th class="px-6 py-4 font-semibold text-[10px] text-center">Total Alpha</th>
              <th v-if="canManageKonseling" class="px-6 py-4 font-semibold text-[10px] text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in wajibList" :key="item.studentId" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4">
                <p class="font-bold text-slate-700 text-sm">{{ item.name }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500 font-mono">{{ item.nisn }}</td>
              <td class="px-6 py-4 text-sm text-slate-600 font-medium">{{ item.kelas }}</td>
              <td class="px-6 py-4 text-center">
                <span class="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black">
                  {{ item.totalLate }}x
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-black">
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

    <div v-if="activeTab === 'riwayat'" class="text-left animate-in fade-in duration-150">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-[#1A2342]">Riwayat Konseling</h2>
            <span class="text-xs text-gray-400 font-bold bg-white border border-slate-200 px-2.5 py-1 rounded-lg">{{ filteredRiwayatList.length }} Data</span>
          </div>

          <div class="flex flex-wrap items-end gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div class="flex-1 min-w-[280px] relative">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Cari nama siswa</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  v-model="historySearchQuery"
                  type="text"
                  @focus="handleHistorySearchFocus"
                  @blur="handleHistorySearchBlur"
                  placeholder="Ketik nama atau NISN siswa..."
                  class="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold"
                />
                <button
                  v-if="historySearchQuery"
                  @click="historySearchQuery = ''"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div v-if="isHistorySearchFocused && filteredSiswaHistory.length > 0" class="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg">
                <div
                  v-for="siswa in filteredSiswaHistory"
                  :key="siswa.id"
                  @mousedown="handleSelectHistorySiswa(siswa)"
                  class="flex items-center justify-between px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                >
                  <div>
                    <p class="text-sm font-bold text-[#1A2342]">{{ siswa.nama }}</p>
                    <p class="text-xs text-gray-400 font-mono mt-0.5">{{ siswa.nisn }}</p>
                  </div>
                  <span class="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-bold">{{ siswa.namaKelas }}</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Dari</label>
              <input type="date" v-model="filterStartDate" class="text-sm border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#26A69A] font-semibold text-slate-600" />
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Sampai</label>
              <input type="date" v-model="filterEndDate" class="text-sm border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#26A69A] font-semibold text-slate-600" />
            </div>
            <button @click="handleFilterRiwayat" class="bg-[#1A2342] text-white px-5 h-9 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-sm">
              Filter
            </button>
          </div>

          <div v-if="selectedHistorySiswaData" class="mt-3 flex items-center justify-between bg-teal-50 border border-teal-100 rounded-xl px-4 py-2 animate-in fade-in slide-in-from-top-1">
            <div>
              <p class="text-sm font-black text-[#1A2342]">{{ selectedHistorySiswaData.nama }}</p>
              <p class="text-xs text-slate-500 font-mono mt-0.5">{{ selectedHistorySiswaData.nisn }} · {{ selectedHistorySiswaData.namaKelas }}</p>
            </div>
            <button @click="clearHistoryFilter" class="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider">Lepas Filter</button>
          </div>
        </div>

        <div v-if="isLoadingRiwayat" class="p-12 text-center text-gray-400 text-sm animate-pulse">
          Memuat data riwayat konseling...
        </div>

        <div v-else-if="filteredRiwayatList.length === 0" class="p-12 text-center text-gray-400 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Tidak ada data riwayat bimbingan konseling yang sesuai.
        </div>

        <table v-else class="w-full text-left">
          <thead class="bg-[#1A2342] text-white text-xs uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4 font-semibold text-[10px]">Siswa</th>
              <th class="px-6 py-4 font-semibold text-[10px]">Waktu & Ruangan</th>
              <th class="px-6 py-4 font-semibold text-[10px]">Topik Bimbingan</th>
              <th class="px-6 py-4 font-semibold text-[10px]">Jenis Pelanggaran</th>
              <th class="px-6 py-4 font-semibold text-[10px] text-center">Status</th>
              <th v-if="canManageKonseling" class="px-6 py-4 font-semibold text-[10px] text-center">Aksi</th>
              <th v-if="canManageKonseling" class="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filteredRiwayatList" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4">
                <p class="font-bold text-slate-700 text-sm">{{ item.siswaNama }}</p>
                <p class="text-xs text-gray-400 font-mono mt-0.5">{{ item.siswaNisn }}</p>
              </td>
              <td class="px-6 py-4 text-xs text-slate-600 font-semibold leading-relaxed">
                <p class="text-slate-700 font-bold">{{ formatDate(item.date) }}</p>
                <p class="text-gray-400 font-mono text-[11px] mt-0.5">⏱ {{ item.waktuMulai ? item.waktuMulai.slice(0, 5) : '00:00' }} - {{ item.waktuSelesai ? item.waktuSelesai.slice(0, 5) : '00:00' }}</p>
                <p class="text-teal-600 font-bold text-[11px] mt-0.5">📍 {{ item.tempat || '-' }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate font-medium" :title="item.topic">{{ item.topic }}</td>
              <td class="px-6 py-4 text-sm text-slate-500 font-semibold">{{ item.jenisPelanggaran || '-' }}</td>
              <td class="px-6 py-4 text-center">
                <span :class="statusBadgeClass(item.status)" class="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td v-if="canManageKonseling" class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button v-if="item.status !== 'SELESAI'" @click="openEditModal(item)" class="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button v-if="item.status !== 'SELESAI'" @click="handleDeleteClick(item.id)" class="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Hapus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <span v-else class="text-xs text-slate-400 font-bold italic select-none">Terkunci</span>
                </div>
              </td>
              <td v-if="canManageKonseling" class="px-6 py-4 text-right">
                <button v-if="item.status !== 'SELESAI'" @click="goCatat(item.id)" class="bg-[#26A69A] hover:bg-[#1f8a7f] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm whitespace-nowrap active:scale-95">
                  Catat Hasil
                </button>
                <span v-else class="text-[10px] bg-slate-100 text-slate-400 px-3 py-1 rounded-full font-black uppercase tracking-wider select-none">Final</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <div>
            <h2 class="text-lg font-bold">Buat Jadwal Konseling</h2>
            <p class="text-xs text-teal-50 opacity-80 mt-0.5">Isi detail rencana pertemuan bimbingan</p>
          </div>
          <button @click="closeCreateModal" class="p-1 hover:bg-white/10 rounded-lg transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-8 space-y-4">
          <div class="space-y-1">
            <div v-if="!createTarget" class="relative">
              <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Cari Siswa Terkait <span class="text-red-400">*</span></label>
              <div class="relative">
                <input v-model="searchQuery" type="text" placeholder="Ketik nama atau NISN siswa..." class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-700" />
                <button v-if="searchQuery" @click="searchQuery = ''" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div v-if="searchQuery && filteredSiswa.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                <div v-for="siswa in filteredSiswa" :key="siswa.id" @click="pilihSiswaForm(siswa)" class="px-4 py-2.5 hover:bg-teal-50 cursor-pointer text-sm border-b border-slate-100 last:border-b-0 flex justify-between items-center transition-colors">
                  <div>
                    <p class="font-bold text-[#1A2342]">{{ siswa.nama }}</p>
                    <p class="text-xs text-gray-400 font-mono mt-0.5">{{ siswa.nisn }}</p>
                  </div>
                  <span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">{{ siswa.namaKelas }}</span>
                </div>
              </div>

              <div v-if="searchQuery && filteredSiswa.length === 0" class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl p-4 text-center text-xs font-bold text-gray-400 shadow-lg">
                Siswa tidak ditemukan dalam database
              </div>
            </div>

            <div v-if="createTarget" class="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex justify-between items-center">
              <div>
                <p class="text-sm font-black text-[#1A2342]">{{ createTarget?.name }}</p>
                <p class="text-xs text-slate-500 font-mono mt-0.5">{{ createTarget?.nisn }} · {{ createTarget?.kelas }}</p>
              </div>
              <button v-if="createTarget?.totalLate === 0" type="button" @click="createTarget = null" class="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider transition-colors">Ganti</button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Tanggal Konseling <span class="text-red-400">*</span></label>
            <input type="date" v-model="createForm.date" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-600" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Jam Mulai <span class="text-red-400">*</span></label>
              <input type="time" v-model="createForm.waktuMulai" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-600" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Jam Selesai <span class="text-red-400">*</span></label>
              <input type="time" v-model="createForm.waktuSelesai" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Tempat / Ruang Pertemuan <span class="text-red-400">*</span></label>
            <input type="text" v-model="createForm.tempat" placeholder="Contoh: Ruang BK Utama / Kelas X-1" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-700" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Topik Utama <span class="text-red-400">*</span></label>
            <input type="text" v-model="createForm.topic" placeholder="Contoh: Keterlambatan berulang" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-700" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Jenis Pelanggaran</label>
            <input type="text" v-model="createForm.violationType" placeholder="Contoh: TERLAMBAT / ALPHA" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-700" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Catatan Awal Kasus</label>
            <textarea v-model="createForm.initialNotes" rows="3" placeholder="Berikan deskripsi singkat kronologi awal..." class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition resize-none font-medium text-slate-600"></textarea>
          </div>

          <div v-if="createError" class="bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {{ createError }}
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button @click="closeCreateModal" type="button" class="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 font-bold transition">Batal</button>
          <button @click="submitCreate" type="button" :disabled="isSubmitting || !createTarget" :class="(!isSubmitting && createTarget) ? 'bg-[#1A2342] hover:bg-[#26A69A]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'" class="px-6 py-2 text-white rounded-xl text-sm font-bold transition shadow-sm">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        <div class="bg-[#26A69A] p-6 text-white flex justify-between items-center">
          <div>
            <h2 class="text-lg font-bold">Edit Jadwal Konseling</h2>
            <p class="text-xs text-teal-50 opacity-80 mt-0.5">Perbarui detail rencana pertemuan bimbingan</p>
          </div>
          <button @click="closeEditModal" class="p-1 hover:bg-white/10 rounded-lg transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-8 space-y-4">
          <div class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <p class="text-sm font-black text-[#1A2342]">{{ editTarget?.siswaNama }}</p>
            <p class="text-xs text-slate-500 font-mono mt-0.5">{{ editTarget?.siswaNisn }}</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Tanggal</label>
            <input type="date" v-model="editForm.date" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-600" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Jam Mulai <span class="text-red-400">*</span></label>
              <input type="time" v-model="editForm.waktuMulai" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-600" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Jam Selesai <span class="text-red-400">*</span></label>
              <input type="time" v-model="editForm.waktuSelesai" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Tempat / Ruang Pertemuan <span class="text-red-400">*</span></label>
            <input type="text" v-model="editForm.tempat" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-700" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Topik Utama</label>
            <input type="text" v-model="editForm.topic" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-700" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Jenis Pelanggaran</label>
            <input type="text" v-model="editForm.violationType" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition font-semibold text-slate-700" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">Catatan Awal Kasus</label>
            <textarea v-model="editForm.initialNotes" rows="3" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26A69A] transition resize-none font-medium text-slate-600"></textarea>
          </div>

          <div v-if="editError" class="bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {{ editError }}
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button @click="closeEditModal" class="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 font-bold transition">Batal</button>
          <button @click="submitEdit" class="px-6 py-2 bg-[#1A2342] text-white rounded-xl text-sm font-bold hover:bg-[#26A69A] transition shadow-sm active:scale-95">Simpan Perubahan</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all animate-in slide-in-from-bottom-4 duration-300" :class="toast.type === 'success' ? 'bg-[#26A69A] text-white' : 'bg-red-500 text-white'">
      {{ toast.message }}
    </div>

    <ConfirmationModal
      :show="isDeleteModalOpen"
      title="Hapus Jadwal Pertemuan"
      message="Apakah Anda yakin ingin menghapus jadwal konseling siswa ini? Data rekor pertemuan akan dialihkan ke dalam arsip soft-delete sistem."
      confirm-text="Hapus Jadwal"
      cancel-text="Batal"
      variant="danger"
      @close="isDeleteModalOpen = false"
      @confirm="submitDeleteKonseling"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useKonselingStore } from '@/stores/konseling'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'

// Local Component View Tabs
const tabs = [
  { key: 'wajib', label: 'Wajib Konseling' },
  { key: 'riwayat', label: 'Riwayat Konseling' },
]
const activeTab = ref('wajib')

const router = useRouter()
const konselingStore = useKonselingStore()

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

// Search History Local State
const isHistorySearchFocused = ref(false)

// State Pengendali Alur Modal Konfirmasi Hapus Jadwal
const isDeleteModalOpen = ref(false)
const selectedKonselingId = ref<number | null>(null)

// State Kalender Grid Periode Bulan Dinamis
const isMonthPickerOpen = ref(false)
const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const monthNamesFull = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const currentPickerYear = ref(new Date().getFullYear())

watch(selectedMonth, (newVal) => {
  if (newVal) {
    const [year] = newVal.split('-')
    currentPickerYear.value = parseInt(year!, 10)
  }
}, { immediate: true })

const formatSelectedMonthLabel = computed(() => {
  if (!selectedMonth.value) return 'Pilih Periode'
  const [year, month] = selectedMonth.value.split('-')
  const monthIdx = parseInt(month!, 10) - 1
  return `${monthNamesFull[monthIdx]} ${year}`
})

const isCurrentSelected = (monthIndex: number) => {
  if (!selectedMonth.value) return false
  const [year, month] = selectedMonth.value.split('-')
  return currentPickerYear.value === parseInt(year!, 10) && (monthIndex + 1) === parseInt(month!, 10)
}

const selectMonthAndYear = (monthIndex: number) => {
  const formattedMonth = String(monthIndex + 1).padStart(2, '0')
  selectedMonth.value = `${currentPickerYear.value}-${formattedMonth}`
  isMonthPickerOpen.value = false
}

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

const handleFilterRiwayat = () => {
  fetchRiwayatKonseling(
    filterStudentId.value ?? undefined,
    filterStartDate.value || undefined,
    filterEndDate.value || undefined
  )
}

const handleDeleteClick = (id: number) => {
  selectedKonselingId.value = id
  isDeleteModalOpen.value = true
}

const submitDeleteKonseling = () => {
  if (selectedKonselingId.value !== null) {
    removeKonseling(selectedKonselingId.value)
    isDeleteModalOpen.value = false
    selectedKonselingId.value = null
  }
}

const goCatat = (id: number) => {
  router.push({ name: 'catat-hasil-konseling', params: { id: String(id) } })
}

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

// Watchers & Side Effects
watch(selectedMonth, (newMonth) => {
  fetchWajibKonseling(newMonth)
})

watch(activeTab, (tab) => {
  if (tab === 'riwayat') {
    handleFilterRiwayat()
  }
})

onMounted(() => {
  fetchWajibKonseling(selectedMonth.value)
})
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
