import api from './api'

export interface CreateKeterlambatanPayload {
  siswaId: number
  tanggal?: string
  waktuMasuk: string
  alasanTerlambat: string
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
  namaKelas?: string
  tanggal: string
  status: 'TERLAMBAT'
  waktuMasuk: string
  alasanTerlambat: string
}

export const absensiService = {
  catatKeterlambatan: async (payload: CreateKeterlambatanPayload): Promise<ApiResponse<CatatKeterlambatanResponse>> => {
    const response = await api.post('/absensi/keterlambatan', payload)
    return response.data
  },
  getRiwayatKeterlambatanHarian: async (tanggal?: string): Promise<ApiResponse<CatatKeterlambatanResponse[]>> => {
    const response = await api.get('/absensi/keterlambatan', {
      params: tanggal ? { tanggal } : undefined,
    })
    return response.data
  },
}
