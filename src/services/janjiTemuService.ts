import api from './api'
import type { JanjiTemuCreateRequest, JanjiTemuUpdateRequest, JanjiTemuResponse } from '@/models/janjiTemu'

export const janjiTemuService = {
  getById: async (id: number): Promise<JanjiTemuResponse> => {
    const response = await api.get(`/janji-temu/${id}`)
    return response.data
  },

  create: async (data: JanjiTemuCreateRequest): Promise<JanjiTemuResponse> => {
    const response = await api.post('/janji-temu', data)
    return response.data
  },

  update: async (id: number, data: JanjiTemuUpdateRequest): Promise<JanjiTemuResponse> => {
    const response = await api.put(`/janji-temu/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/janji-temu/${id}`)
  },
}
