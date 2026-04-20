// src/services/dispensasiService.ts

import api from './api'
import type { Dispensasi, CreateDispensasiPayload, UpdateDispensasiPayload } from '@/models/dispensasi'

// ATD-07: Create dispensasi
export const createDispensasi = async (payload: CreateDispensasiPayload): Promise<Dispensasi> => {
  const res = await api.post('/dispensasi', payload)
  return res.data.data
}

// ATD-09: Update dispensasi
export const updateDispensasi = async (id: number, payload: UpdateDispensasiPayload): Promise<Dispensasi> => {
  const res = await api.put(`/dispensasi/${id}`, payload)
  return res.data.data
}

// Ambil semua dispensasi
export const getAllDispensasi = async (): Promise<Dispensasi[]> => {
  const res = await api.get('/dispensasi')
  return res.data
}

// Izin aktif hari ini
export const getDispensasiToday = async (): Promise<Dispensasi[]> => {
  const res = await api.get('/dispensasi/today')
  return res.data.data
}