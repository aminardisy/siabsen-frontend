// src/services/siswaService.ts
import api from './api';
import type { SiswaRequest, SiswaResponse } from '../models/siswa';

export const siswaService = {
  // Mengambil semua siswa
  getAll: async (): Promise<SiswaResponse[]> => {
    const response = await api.get('/siswa');
    // Menormalkan response backend agar seluruh view bisa memakai nama/namaLengkap.
    return response.data.map((siswa: SiswaResponse) => ({
      ...siswa,
      namaLengkap: siswa.nama,
    }));
  },

  // Membuat siswa baru (Mengirim SiswaRequest)
  create: (data: SiswaRequest) => api.post('/siswa', data),

  // Update data siswa
  update: (id: number, data: SiswaRequest) => api.put(`/siswa/${id}`, data),

  // Menonaktifkan siswa (Soft Delete)
  deactivate: (id: number, alasan: string) =>
    api.patch(`/siswa/${id}/nonaktif`, { alasan })
};
