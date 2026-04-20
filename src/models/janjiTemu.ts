export interface JanjiTemuCreateRequest {
  siswaId: number | null
  guruId: number | null
  tanggal: string
  waktu: string
  keperluan: string
}

export interface JanjiTemuUpdateRequest {
  siswaId: number | null
  guruId: number | null
  tanggal: string
  waktu: string
  keperluan: string
}

export interface JanjiTemuStatusUpdateRequest {
  status: JanjiTemuStatus
}

export type JanjiTemuStatus = 'WAITING' | 'APPROVED' | 'REJECTED' | 'FINISHED'

export interface JanjiTemuListItemResponse {
  id: number
  tanggal: string
  waktu: string
  namaSiswa: string
  status: JanjiTemuStatus
}

export interface JanjiTemuDetailResponse {
  id: number
  tanggal: string
  waktu: string
  keperluan: string
  status: JanjiTemuStatus
  waktuPengajuan: string
  waktuKonfirmasi: string | null
  siswa: {
    id: number
    nisn: string
    nama: string
    namaKelas: string
  }
  guru: {
    id: number
    nama: string
    nuptk: string
  }
}

export interface JanjiTemuResponse {
  id: number
  namaSiswa: string
  namaGuru: string
  keperluan: string
  status: JanjiTemuStatus
  waktuPengajuan: string
}
