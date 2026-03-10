
export interface AccountRequestDTO {
  nama: string;
  email: string;
  password: string;
  role: string;
}

export interface AccountUpdateDTO {
  nama: string;
  role: string;
  email: string;
}

export interface AccountResponseDTO {
  id: string;
  nama: string;
  email: string;
  role: string;
  status: string;
  deletedAt?: string | null; 
}