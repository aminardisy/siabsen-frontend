import api from './api'

export interface DailyPulseDTO {
  tanggal: string
  totalSiswa: number
  kelasLapor: number
  totalKelas: number
  hadir: number
  sakit: number
  izin: number
  alfa: number
  terlambat: number
  dispensasi: number
  kelasBelumLaporList: string[]
}

export interface PeriodSummaryDTO {
  startDate: string
  endDate: string
  totalHadir: number
  totalSakit: number
  totalIzin: number
  totalAlfa: number
  totalTerlambat: number
  totalDispensasi: number
}

export interface DashboardResponse {
  today: DailyPulseDTO
  period: PeriodSummaryDTO
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string>
}

export const dashboardService = {
  getDashboardData: async (startDate?: string, endDate?: string): Promise<ApiResponse<DashboardResponse>> => {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    const response = await api.get('/dashboard', { params })
    return response.data
  },
}