import { create } from 'zustand'
import { LoginResponse, UserRole } from '../types'

interface AuthUser {
  userId: number
  username: string
  role: UserRole
  email: string
}

interface AuthStore {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (response: LoginResponse) => void
  logout: () => void
  isAdmin: () => boolean
}

// Rehydrate from localStorage on startup
const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')
let initialUser: AuthUser | null = null
try {
  if (storedUser) initialUser = JSON.parse(storedUser)
} catch {
  initialUser = null
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: storedToken,
  user: initialUser,
  isAuthenticated: !!storedToken && !!initialUser,

  login: (response: LoginResponse) => {
    const user: AuthUser = {
      userId: response.userId,
      username: response.username,
      role: response.role,
      email: response.email,
    }
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(user))
    set({
      token: response.token,
      user,
      isAuthenticated: true,
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    })
  },

  isAdmin: () => {
    return get().user?.role === 'ADMIN'
  },
}))
