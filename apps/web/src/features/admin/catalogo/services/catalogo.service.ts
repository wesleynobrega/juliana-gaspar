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

  getById: (id: string) => api.get<{ data: PratoListItem }>(`/dishes/${id}`).then((r) => r.data),

  create: (dto: Record<string, unknown>) =>
    api.post<{ data: PratoListItem }>('/dishes', dto).then((r) => r.data),

  update: (id: string, dto: Record<string, unknown>) =>
    api.put<{ data: PratoListItem }>(`/dishes/${id}`, dto).then((r) => r.data),

  remove: (id: string) => api.delete(`/dishes/${id}`),

  duplicate: (id: string) =>
    api.post<{ data: PratoListItem }>(`/dishes/${id}/duplicate`, {}).then((r) => r.data),
};
