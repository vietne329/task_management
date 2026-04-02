import api from './api'
import { KnowledgeNote, KnowledgeNoteRequest } from '../types'

export const knowledgeService = {
  async getAll(): Promise<KnowledgeNote[]> {
    const { data } = await api.get<KnowledgeNote[]>('/knowledge')
    return data
  },

  async getCategories(): Promise<string[]> {
    const { data } = await api.get<string[]>('/knowledge/categories')
    return data
  },

  async getByCategory(category: string): Promise<KnowledgeNote[]> {
    const { data } = await api.get<KnowledgeNote[]>('/knowledge/by-category', { params: { category } })
    return data
  },

  async search(q: string): Promise<KnowledgeNote[]> {
    const { data } = await api.get<KnowledgeNote[]>('/knowledge/search', { params: { q } })
    return data
  },

  async getById(id: number): Promise<KnowledgeNote> {
    const { data } = await api.get<KnowledgeNote>(`/knowledge/${id}`)
    return data
  },

  async create(request: KnowledgeNoteRequest): Promise<KnowledgeNote> {
    const { data } = await api.post<KnowledgeNote>('/knowledge', request)
    return data
  },

  async update(id: number, request: KnowledgeNoteRequest): Promise<KnowledgeNote> {
    const { data } = await api.put<KnowledgeNote>(`/knowledge/${id}`, request)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/knowledge/${id}`)
  },
}
