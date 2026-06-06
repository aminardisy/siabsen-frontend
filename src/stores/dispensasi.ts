// src/stores/dispensasi.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Dispensasi, CreateDispensasiPayload, UpdateDispensasiPayload } from '@/models/dispensasi'
import * as dispensasiService from '@/services/dispensasiService'
import { updateStatusDispensasi } from '@/services/dispensasiService'

export const useDispensasiStore = defineStore('dispensasi', () => {
  const dispensasiList = ref<Dispensasi[]>([])
  const izinAktifHariIni = ref<Dispensasi[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch semua dispensasi
  const fetchAll = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await dispensasiService.getAllDispensasi()
      // FIX: Bongkar paksa bungkusan data berlapis agar terjamin berupa array murni
      const dataArray = Array.isArray(res) ? res : (res as any).data?.data || (res as any).data || []
      dispensasiList.value = dataArray
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Gagal memuat data dispensasi'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch izin aktif hari ini
  const fetchToday = async () => {
    try {
      const res = await dispensasiService.getDispensasiToday()
      // FIX: Gunakan saringan array murni yang sama
      const dataArray = Array.isArray(res) ? res : (res as any).data?.data || (res as any).data || []
      izinAktifHariIni.value = dataArray
    } catch {
      izinAktifHariIni.value = []
    }
  }

  // ATD-07: Create
  const create = async (payload: CreateDispensasiPayload): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const res = await dispensasiService.createDispensasi(payload)
      const newData = (res as any).data?.data || (res as any).data || res

      if (!Array.isArray(dispensasiList.value)) {
        dispensasiList.value = []
      }

      dispensasiList.value.unshift(newData)
      await fetchToday()
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Gagal menyimpan dispensasi'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // ATD-09: Update
  const update = async (id: number, payload: UpdateDispensasiPayload): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const res = await dispensasiService.updateDispensasi(id, payload)
      // FIX: Normalisasi data response
      const updated = (res as any).data?.data || (res as any).data || res

      if (!Array.isArray(dispensasiList.value)) {
        dispensasiList.value = []
      }

      const idx = dispensasiList.value.findIndex(d => d.id === id)
      if (idx !== -1) dispensasiList.value[idx] = updated
      await fetchToday()
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Gagal mengupdate dispensasi'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const updateStatus = async (id: number, status: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const res = await updateStatusDispensasi(id, status)
      const updated = (res as any).data?.data || (res as any).data || res

      if (!Array.isArray(dispensasiList.value)) {
        dispensasiList.value = []
      }

      const idx = dispensasiList.value.findIndex(d => d.id === id)
      if (idx !== -1) dispensasiList.value[idx] = updated
      await fetchToday()
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Gagal mengupdate status'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    dispensasiList,
    izinAktifHariIni,
    isLoading,
    error,
    fetchAll,
    fetchToday,
    create,
    update,
    updateStatus,
  }
})
