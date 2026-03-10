export interface GuruResponse {
  id: number;
  nip: string; // Sesuai GuruListItemResponse
  nama: string;
  jabatan: string;
}

export interface GuruRequest {
  nama: string;
  nuptk: string; // Sesuai CreateGuruRequest
  jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN'; // Sesuai Enum Gender di BE
  mataPelajaran: string;
}
