import { api } from '@/lib/api-client';
import type { OrderDTO } from '@juliana-gaspar/contracts';
import type { PedidoFilter, PedidoListItem } from '../types';

export const pedidosService = {
  list: (filters: PedidoFilter = {}, page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (filters.status?.length) params.set('status', filters.status.join(','));
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
    if (filters.planType) params.set('planType', filters.planType);
    if (filters.search) params.set('search', filters.search);
    return api.get<{ data: PedidoListItem[]; total: number; page: number; limit: number; totalPages: number }>(
      `/orders?${params.toString()}`,
    );
  },

  getById: (id: string) =>
    api.get<{ data: OrderDTO }>(`/orders/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
};
