import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_INSFORGE_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY as string
  if (anonKey) {
    config.headers['apikey'] = anonKey
  }

  const token = localStorage.getItem('insforge_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('insforge_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
