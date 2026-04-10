import axios from 'axios'
import { API_BASE_URL } from './api.config'

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
http.interceptors.request.use(config => {
  const token = localStorage.getItem('trinetra_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
http.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('trinetra_token')
      localStorage.removeItem('trinetra_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default http
