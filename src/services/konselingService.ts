// src/services/konselingService.ts

import api from './api'
import type {
  SiswaWajibKonseling,
  RiwayatKonseling,
  KonselingDetail,
  CreateKonselingPayload,
  UpdateKonselingPayload,
} from '@/models/konseling'

// PK-01: Daftar siswa wajib konseling
export const getSiswaWajibKonseling = async (
  month?: string,
  classId?: number
): Promise<SiswaWajibKonseling[]> => {
  const params: any = {}
  if (month) params.month = month
  if (classId) params.classId = classId
  const res = await api.get('/konseling/wajib', { params })
  return res.data.data || []
}

// PK-02: Buat jadwal konseling
export const createKonseling = async (
  payload: CreateKonselingPayload
): Promise<KonselingDetail> => {
  const res = await api.post('/konseling', payload)
  return res.data.data
}

// PK-04: Riwayat konseling (optional filter per siswa)
export const getRiwayatKonseling = async (
  studentId?: number,
  startDate?: string,
  endDate?: string
): Promise<RiwayatKonseling[]> => {
  const params: any = {}
  if (studentId) params.studentId = studentId
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  const res = await api.get('/konseling', { params })
  return res.data.data || []
}

// PK-05: Update jadwal konseling
export const updateKonseling = async (
  id: number,
  payload: UpdateKonselingPayload
): Promise<KonselingDetail> => {
  const res = await api.put(`/konseling/${id}`, payload)
  return res.data.data
}

// PK-06: Hapus jadwal konseling (soft delete)
export const deleteKonseling = async (id: number): Promise<void> => {
  await api.delete(`/konseling/${id}`)
}