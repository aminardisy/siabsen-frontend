import api from './axios';
import type { Siswa } from '../models/siswa'; 

export const siswaService = {
  getAll: async () => {
    const response = await api.get('/siswa');
    return response.data.data;
  },

  create: (data: Siswa) => api.post('/siswa', data),
  
  update: (id: number, data: Siswa) => api.put(`/siswa/${id}`, data),
  
  deactivate: (id: number, alasan: string) => 
    api.patch(`/siswa/${id}/nonaktif`, { alasan })
};