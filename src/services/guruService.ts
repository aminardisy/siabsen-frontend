import api from './api'
import type { GuruRequest, GuruResponse } from '@/models/guru'

export const guruService = {
  getAll: async (): Promise<GuruResponse[]> => {
    const res = await api.get('/guru')
    return res.data.data.items
  },
  create: (data: GuruRequest) => api.post('/guru', data),
  update: (id: number, data: GuruRequest) => api.put(`/guru/${id}`, data),
  delete: (id: number) => api.delete(`/guru/${id}`)
}
