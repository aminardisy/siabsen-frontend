import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Tambahkan Interceptor untuk menyisipkan Token JWT
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage (sesuai logika auth.ts kamu)
    const token = localStorage.getItem('token')

    if (token) {
      // Tempelkan ke header Authorization
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Tambahkan Response Interceptor untuk handle jika token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Jika 401, paksa logout karena token mungkin tidak valid/expired
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
