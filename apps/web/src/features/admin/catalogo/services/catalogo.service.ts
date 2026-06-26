import { api } from '@/lib/api-client';
import type { PratoListItem } from '../types';

export const catalogoService = {
  list: (page = 1, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    return api.get<{ data: PratoListItem[]; total: number; page: number; limit: number; totalPages: number }>(
      `/dishes?${params.toString()}`,
    );
  },

  getById: (id: string) => api.get<PratoListItem>(`/dishes/${id}`),

  create: (dto: Record<string, unknown>) =>
    api.post<PratoListItem>('/dishes', dto),

  update: (id: string, dto: Record<string, unknown>) =>
    api.put<PratoListItem>(`/dishes/${id}`, dto),

  remove: (id: string) => api.delete(`/dishes/${id}`),

  duplicate: (id: string) =>
    api.post<PratoListItem>(`/dishes/${id}/duplicate`, {}),
};
