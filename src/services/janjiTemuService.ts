import api from './api'
import type {
  JanjiTemuCreateRequest,
  JanjiTemuDetailResponse,
  JanjiTemuListItemResponse,
  JanjiTemuResponse,
  JanjiTemuStatusUpdateRequest,
  JanjiTemuUpdateRequest,
} from '@/models/janjiTemu'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string>
}

const extractPayload = <T>(responseData: any): T => {
  if (responseData?.data !== undefined) {
    return responseData.data as T
  }

  return responseData as T
}

export const janjiTemuService = {
  getAll: async (): Promise<JanjiTemuListItemResponse[]> => {
    const response = await api.get('/janji-temu')
    return extractPayload<JanjiTemuListItemResponse[]>(response.data)
  },

  getById: async (id: number): Promise<JanjiTemuDetailResponse> => {
    const response = await api.get(`/janji-temu/${id}`)
    return extractPayload<JanjiTemuDetailResponse>(response.data)
  },

  create: async (data: JanjiTemuCreateRequest): Promise<JanjiTemuResponse> => {
    const response = await api.post('/janji-temu', data)
    return extractPayload<JanjiTemuResponse>(response.data)
  },

  update: async (id: number, data: JanjiTemuUpdateRequest): Promise<JanjiTemuResponse> => {
    const response = await api.put(`/janji-temu/${id}`, data)
    return extractPayload<JanjiTemuResponse>(response.data)
  },

  updateStatus: async (
    id: number,
    data: JanjiTemuStatusUpdateRequest,
  ): Promise<ApiResponse<JanjiTemuResponse>> => {
    const response = await api.put(`/janji-temu/${id}/status`, data)
    return response.data as ApiResponse<JanjiTemuResponse>
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/janji-temu/${id}`)
  },
}
