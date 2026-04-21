import api from './api';
import type { RekapSiswaResponse } from '@/models/rekap';

const API_URL = 'http://localhost:8080/api/rekap-siswa';

export const rekapService = {
  async getRekapSiswa(id: string | number, params: { range: string, date: string }): Promise<RekapSiswaResponse> {
    const response = await api.get(`/rekap-siswa/siswa/${id}`, { params });
    return response.data;
  }
};
