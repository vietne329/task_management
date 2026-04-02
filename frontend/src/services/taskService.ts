import api from './api'
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types'

export const taskService = {
  async getAllTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks')
    return response.data
  },

  async getMyTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks/my-tasks')
    return response.data
  },

  async getTaskById(id: number): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`)
    return response.data
  },

  async createTask(request: CreateTaskRequest): Promise<Task> {
    const response = await api.post<Task>('/tasks', request)
    return response.data
  },

  async updateTask(id: number, request: UpdateTaskRequest): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, request)
    return response.data
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },
}
