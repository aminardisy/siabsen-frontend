export interface SiswaResponse {
  id: number;
  nisn: string;
  nama: string;
  namaLengkap?: string;
  namaKelas: string;
  jenisKelamin: string;
  status: string;
}

export interface SiswaRequest {
  nisn: string;
  namaLengkap: string;
  kelasId: number | null;
  jenisKelamin: string;
}
