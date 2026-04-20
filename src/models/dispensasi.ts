// src/models/dispensasi.ts

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED'
export type DispensasiType = 'DISPENSASI' | 'SAKIT' | 'IZIN'

export interface Dispensasi {
  id: number
  siswaId: number
  siswaNama: string
  siswaNisn: string
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
  buktiDocUrl: string | null
  jenis: string
  statusApproval: ApprovalStatus
}

export interface CreateDispensasiPayload {
  siswaId: number
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
  jenis: string
  buktiDocUrl?: string | null
}

export interface UpdateDispensasiPayload {
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
  buktiDocUrl?: string | null
}