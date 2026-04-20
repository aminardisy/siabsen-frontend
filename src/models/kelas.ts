export interface KelasResponse {
  id: number;
  namaKelas: string;
  tingkat: string;
  jurusan: string;
  namaWaliKelas: string;
  nipWaliKelas: string;
  jumlahSiswa: number;
  tahunAjaran: string;
}

export interface KelasRequest {
  namaKelas: string;
  tingkat: string;
  jurusan: string;
  guruId: number | null;
  tahunAjaran: string;
}

