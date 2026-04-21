export interface RiwayatAbsensi {
  tanggal: string;
  tipe: 'SAKIT' | 'IZIN' | 'ALFA' | 'TERLAMBAT' | 'DISPENSASI';
  keterangan: string;
}

export interface RekapSiswaResponse {
  siswaId: number;
  nama: string;
  nisn: string;
  kelas: string;
  statusKehadiran: 'AMAN' | 'PERLU DIPERHATIKAN' | 'BAHAYA';
  jumlahSakit: number;
  jumlahIzin: number;
  jumlahTerlambat: number;
  jumlahAlfa: number;
  riwayat: RiwayatAbsensi[];
}
