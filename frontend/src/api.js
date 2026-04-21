import axios from 'axios'

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:4000/api'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tabibi_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default api
