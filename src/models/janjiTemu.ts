export interface JanjiTemuCreateRequest {
  siswaId: number | null
  guruId: number | null
  keperluan: string
}

export interface JanjiTemuUpdateRequest {
  siswaId: number | null
  guruId: number | null
  keperluan: string
}

export interface JanjiTemuResponse {
  id: number
  siswa: unknown
  guru: unknown
  keperluan: string
  status: 'WAITING' | 'APPROVED' | 'REJECTED' | 'FINISHED'
  waktuPengajuan: string
  waktuKonfirmasi: string | null
}
