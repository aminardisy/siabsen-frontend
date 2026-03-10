import api from './api';
import type { KelasRequest, KelasResponse } from '../models/kelas';

export const kelasService = {
  getAll: async (): Promise<KelasResponse[]> => {
    const response = await api.get('/kelas');
    return response.data
  },

  create: (data: KelasRequest) => api.post('/kelas', data),

  update: (id: number, data: KelasRequest) => api.put(`/kelas/${id}`, data),

  delete: (id: number) => api.delete(`/kelas/${id}`)
};
