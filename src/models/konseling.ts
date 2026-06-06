// src/models/konseling.ts

export type KonselingStatus = 'PENDING' | 'SELESAI'

export interface SiswaWajibKonseling {
  studentId: number
  nisn: string
  name: string
  kelas: string
  totalLate: number
  totalAlpha: number
}

export interface RiwayatKonseling {
  id: number
  siswaId: number
  siswaNama: string
  siswaNisn: string
  waliKelasNama: string
  date: string
  waktuMulai: string
  waktuSelesai: string
  tempat: string
  topic: string
  jenisPelanggaran: string | null
  catatanAwal: string | null
  ringkasanHasil: string | null
  rekomendasi: string | null
  status: KonselingStatus
  createdAt: string
}

export interface KonselingDetail extends RiwayatKonseling {}

export interface CreateKonselingPayload {
  studentId: number
  date: string
  waktuMulai: string
  waktuSelesai: string
  tempat: string
  topic: string
  violationType?: string
  initialNotes?: string
}

export interface UpdateKonselingPayload {
  date?: string
  topic?: string
  violationType?: string
  initialNotes?: string
  waktuMulai?: string
  waktuSelesai?: string
  tempat: string
}

/** Status hasil di API (request/response) */
export type KonselingHasilStatusApi = 'pending' | 'selesai'

export interface CatatHasilKonselingRequest {
  summary: string
  recommendation: string
  status: KonselingHasilStatusApi
}

export interface CatatHasilKonselingData {
  id: number
  summary: string
  recommendation: string
  status: KonselingHasilStatusApi
  updated_at: string
}

export interface CatatHasilKonselingResponse {
  message: string
  data: CatatHasilKonselingData
}

export interface KonselingDetailResponse {
  id: number
  studentId: number
  studentName: string
  date: string
  topic: string
  violationType: string | null
  initialNotes: string | null
  summary: string | null
  recommendation: string | null
  status: string
  createdAt: string | null
  updatedAt: string | null
}

export interface KonselingMenungguItem {
  id: number
  studentId?: number
  studentName?: string
  date: string
  topic: string
  summary: string | null
  recommendation: string | null
  status: string
}

interface BaseResponseDTO<T> {
  status: number
  message: string
  data: T
  timestamp?: string
}

export type KonselingMenungguListResponse = BaseResponseDTO<KonselingMenungguItem[]>
export type KonselingDetailWrappedResponse = BaseResponseDTO<KonselingDetailResponse>
