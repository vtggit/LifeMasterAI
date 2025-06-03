import axios from 'axios';
import { Store } from '@/types/stores';
import { DealItem } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const storesApi = {
  getStores: async (userId: number): Promise<Store[]> => {
    const response = await api.get<Store[]>('/stores', { params: { userId } });
    return response.data;
  },

  addStore: async (userId: number, store: Omit<Store, 'id'>): Promise<Store> => {
    const response = await api.post<Store>('/stores', store, { params: { userId } });
    return response.data;
  },

  updateStore: async (userId: number, storeId: number, updates: Partial<Store>): Promise<Store> => {
    const response = await api.put<Store>(`/stores/${storeId}`, updates, { params: { userId } });
    return response.data;
  },

  deleteStore: async (userId: number, storeId: number): Promise<void> => {
    await api.delete(`/stores/${storeId}`, { params: { userId } });
  },

  testConnection: async (userId: number, storeId: number): Promise<boolean> => {
    const response = await api.post<{ success: boolean }>(`/stores/${storeId}/test`, {}, { params: { userId } });
    return response.data.success;
  },

  syncDeals: async (userId: number, storeId: number): Promise<{ success: boolean; dealsCount: number }> => {
    const response = await api.post<{ success: boolean; dealsCount: number }>(`/stores/${storeId}/sync`, {}, { params: { userId } });
    return response.data;
  },

  getDeals: async (userId: number, storeId: number): Promise<DealItem[]> => {
    const response = await api.get<DealItem[]>(`/stores/${storeId}/deals`, { params: { userId } });
    return response.data;
  }
};