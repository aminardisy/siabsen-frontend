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

export interface DailyRecordDTO {
  tanggal: string;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPHA' | 'DISPENSASI';
  dokumenUrl?: string;
}


export interface RekapDashboardResponse {
  siswaId?: number;
  kelasId?: number;
  namaSiswa?: string;
  namaKelas?: string;
  nisn?: string; 
  startDate: string;
  endDate: string;
  totalHadir: number;
  totalSakit: number;
  totalIzin: number;
  totalAlfa: number;
  totalDispensasi: number;
  records: DailyRecordDTO[]; 
}

export interface LaporanKeterlambatanResponse {
  siswaId: number
  nisn: string
  namaSiswa: string
  namaKelas: string
  totalKeterlambatan: number
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
  getRekapSiswa: async (siswaId: number, startDate: string, endDate: string): Promise<RekapDashboardResponse> => {
    const response = await api.get(`/absensi/rekap/siswa/${siswaId}`, {
      params: { startDate, endDate }
    })
    return response.data
  },
  
  getRekapKelas: async (kelasId: number, startDate: string, endDate: string): Promise<RekapDashboardResponse> => {
    const response = await api.get(`/absensi/rekap/kelas/${kelasId}`, {
      params: { startDate, endDate }
    })
    return response.data
  },
  getLaporanKeterlambatan: async (startDate: string, endDate: string): Promise<any> => {
    const response = await api.get('/late/report', {
      params: { startDate, endDate }
    })
    return response.data
  }
}
