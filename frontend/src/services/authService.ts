import api from './api'
import { LoginRequest, LoginResponse } from '../types'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // Logout is best-effort; always clear local state
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
}
