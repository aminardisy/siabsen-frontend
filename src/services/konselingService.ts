import api from './api'
import type {
  CatatHasilKonselingRequest,
  CatatHasilKonselingResponse,
  KonselingDetailResponse,
  KonselingDetailWrappedResponse,
  KonselingMenungguItem,
  KonselingMenungguListResponse,
} from '@/models/konseling'

export const konselingService = {
  /** GET /api/konseling/wali/menunggu */
  listMenungguUntukWali: async (): Promise<KonselingMenungguItem[]> => {
    const { data: body } = await api.get<KonselingMenungguListResponse>('/konseling/wali/menunggu')
    return body?.data ?? []
  },

  /** GET /api/konseling/wali/{id} */
  getDetailUntukWali: async (id: number): Promise<KonselingDetailResponse> => {
    const { data: body } = await api.get<KonselingDetailWrappedResponse>(`/konseling/wali/${id}`)
    if (!body?.data) {
      throw new Error('Data konseling tidak ditemukan')
    }
    return body.data
  },

  /** PUT /api/konseling/{id}/hasil */
  catatHasil: async (id: number, body: CatatHasilKonselingRequest): Promise<CatatHasilKonselingResponse> => {
    const { data } = await api.put<CatatHasilKonselingResponse>(`/konseling/${id}/hasil`, body)
    return data
  },
}
