import axios from 'axios'
import { getTokens } from '../store/auth'

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const tokens = getTokens()
  if (tokens?.access) {
    config.headers = config.headers ?? {}
    config.headers['Authorization'] = `Bearer ${tokens.access}`
  }
  return config
})

export default api


