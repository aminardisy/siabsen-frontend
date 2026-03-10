import api from './axios';
import type { LoginRequest, LoginResponse } from '../models/auth';

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; 
  },

  logout: async () => {
    return await api.post('/auth/logout');
  }
};