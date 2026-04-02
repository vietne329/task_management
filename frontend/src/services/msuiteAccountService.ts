import api from './api'
import { MsuiteAccount, MsuiteAccountRequest, MsuiteCountry } from '../types'

export const msuiteAccountService = {
  async getAll(): Promise<MsuiteAccount[]> {
    const response = await api.get<MsuiteAccount[]>('/msuite-accounts')
    return response.data
  },

  async getByCountry(country: MsuiteCountry): Promise<MsuiteAccount[]> {
    const response = await api.get<MsuiteAccount[]>(`/msuite-accounts/by-country/${country}`)
    return response.data
  },

  async getById(id: number): Promise<MsuiteAccount> {
    const response = await api.get<MsuiteAccount>(`/msuite-accounts/${id}`)
    return response.data
  },

  async create(request: MsuiteAccountRequest): Promise<MsuiteAccount> {
    const response = await api.post<MsuiteAccount>('/msuite-accounts', request)
    return response.data
  },

  async update(id: number, request: MsuiteAccountRequest): Promise<MsuiteAccount> {
    const response = await api.put<MsuiteAccount>(`/msuite-accounts/${id}`, request)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/msuite-accounts/${id}`)
  },
}
