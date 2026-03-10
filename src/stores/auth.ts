import { defineStore } from 'pinia';
import { authService } from '@/api/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUserRole: (state) => state.user?.role || null,
  },

  actions: {
    async login(credentials: any) {
      try {
        const res = await authService.login(credentials);
        const loginData = res.data; 

        // Save to state
        this.token = loginData.token;
        this.user = {
          id: loginData.id,
          email: loginData.email,
          nama: loginData.nama,
          role: loginData.role
        };

        // Persist to localStorage for page refreshes
        localStorage.setItem('token', this.token!);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return res;
      } catch (error) {
        throw error;
      }
    },

    async logout() {
      try {
        await authService.logout();
      } catch (error) {
        console.warn("Backend logout failed, proceeding with local cleanup");
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token'); 
        localStorage.removeItem('user');
        
        window.location.href = '/login'; 
      }
    }
  }
});