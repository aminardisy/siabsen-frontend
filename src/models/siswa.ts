export interface Siswa {
  id?: number;
  nisn: string;
  namaLengkap: string;
  namaKelas: string; // Sesuai DTO yang mengembalikan string nama kelas
  jenisKelamin: string;
  status: string;
}
