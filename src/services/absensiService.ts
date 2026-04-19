import api from './api'

export interface CreateKeterlambatanPayload {
  siswaId: number
  tanggal?: string
  waktuMasuk: string
  alasanTerlambat: string
  catatan?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string>
}

export interface CatatKeterlambatanResponse {
  id: number
  siswaId: number
  namaSiswa: string
  tanggal: string
  status: 'TERLAMBAT'
  waktuMasuk: string
  alasanTerlambat: string
  catatan?: string
}

export const absensiService = {
  catatKeterlambatan: async (payload: CreateKeterlambatanPayload): Promise<ApiResponse<CatatKeterlambatanResponse>> => {
    const response = await api.post('/absensi/keterlambatan', payload)
    return response.data
  }
}
