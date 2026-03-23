import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const getPersistedToken = (): string | null => {
  const runtimeToken = useAuthStore.getState().token
  if (runtimeToken) return runtimeToken

  try {
    const raw = localStorage.getItem('stratto-auth')
    if (!raw) return null

    const parsed = JSON.parse(raw) as {
      state?: {
        token?: string | null
      }
    }

    return parsed.state?.token ?? null
  } catch {
    return null
  }
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getPersistedToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor: handle 401 ────────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 402) {
      if (window.location.pathname !== '/subscription') {
        window.location.href = '/subscription'
      }
      return Promise.reject(error)
    }

    // 403 também é usado para regras de permissão do domínio (RBAC/scope).
    // Deslogar em todo 403 causava perda de sessão indevida.
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
