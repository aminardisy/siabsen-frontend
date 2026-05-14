/** Status hasil di API (request/response) */
export type KonselingHasilStatusApi = 'selesai' | 'perlu_monitoring'

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
