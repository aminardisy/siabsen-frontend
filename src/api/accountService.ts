import api from './axios'
import type { AccountResponseDTO, AccountRequestDTO, AccountUpdateDTO } from '@/models/account'

export const accountService = {
  getAll: async () => {
    const response = await api.get('/accounts/all')
    return response.data.data 
  },
  
  create: (data: AccountRequestDTO) => api.post('/accounts/create', data),
  
  update: (id: string, data: AccountUpdateDTO) => api.patch(`/accounts/update/${id}`, data),
  
  delete: (id: string) => api.delete(`/accounts/delete/${id}`) 
}