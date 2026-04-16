import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    const parsed = JSON.parse(token)
    if (parsed.state?.token) {
      config.headers.Authorization = `Bearer ${parsed.state.token}`
    }
  }
  return config
})

export default api
