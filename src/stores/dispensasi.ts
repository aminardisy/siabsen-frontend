// src/stores/dispensasi.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Dispensasi, CreateDispensasiPayload, UpdateDispensasiPayload } from '@/models/dispensasi'
import * as dispensasiService from '@/services/dispensasiService'

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
      dispensasiList.value = await dispensasiService.getAllDispensasi()
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Gagal memuat data dispensasi'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch izin aktif hari ini (untuk panel kanan)
  const fetchToday = async () => {
    try {
      izinAktifHariIni.value = await dispensasiService.getDispensasiToday()
    } catch {
      izinAktifHariIni.value = []
    }
  }

  // ATD-07: Create
  const create = async (payload: CreateDispensasiPayload): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const newData = await dispensasiService.createDispensasi(payload)
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
      const updated = await dispensasiService.updateDispensasi(id, payload)
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

  return {
    dispensasiList,
    izinAktifHariIni,
    isLoading,
    error,
    fetchAll,
    fetchToday,
    create,
    update,
  }
})