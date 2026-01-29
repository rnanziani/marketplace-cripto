import axios from 'axios'
import { API_BASE_URL } from './config'

/**
 * Cliente HTTP para comunicarse con el backend.
 * - En desarrollo con proxy Vite: baseURL puede ser '' y las peticiones van a /api.
 * - En producción: baseURL debe ser la URL del backend (ej. https://tu-api.onrender.com).
 */
const client = axios.create({
  baseURL: API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token a todas las peticiones si existe
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores 401 (token expirado o inválido)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Opcional: redirigir a login si la app usa React Router
      if (window.location.pathname !== '/login' && window.location.pathname !== '/registro') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client
