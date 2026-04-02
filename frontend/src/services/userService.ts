import api from './api'
import { User, CreateUserRequest } from '../types'

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users')
    return response.data
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },

  async createUser(request: CreateUserRequest): Promise<User> {
    const response = await api.post<User>('/users', request)
    return response.data
  },

  async updateUser(id: number, request: CreateUserRequest): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, request)
    return response.data
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },

  async toggleUserStatus(id: number): Promise<void> {
    await api.patch(`/users/${id}/toggle-status`)
  },
}
