// src/models/konseling.ts

export type KonselingStatus = 'PENDING' | 'SELESAI' | 'PERLU_MONITORING'

export interface SiswaWajibKonseling {
  studentId: number
  nisn: string
  name: string
  kelas: string
  totalLate: number
}

export interface RiwayatKonseling {
  id: number
  siswaId: number
  siswaNama: string
  siswaNisn: string
  waliKelasNama: string
  date: string
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
  topic: string
  violationType?: string
  initialNotes?: string
}

export interface UpdateKonselingPayload {
  date?: string
  topic?: string
  violationType?: string
  initialNotes?: string
}