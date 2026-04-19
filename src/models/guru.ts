export interface GuruResponse {
  id: number;
  nip: string; 
  nama: string;
  jabatan: string;
  tipePegawai: 'GURU' | 'STAFF'; 
}

export interface GuruRequest {
  nama: string;
  nuptk: string; 
  jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN'; 
  mataPelajaran: string;
  tipePegawai: string;
}
