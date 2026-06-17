'use client';

import { useState, useEffect, useCallback } from 'react';
import { pedidosService } from '../services/pedidos.service';
import type { PedidoFilter, PedidoListItem } from '../types';

type UsePedidosReturn = {
  pedidos: PedidoListItem[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: PedidoFilter;
  setFilters: (filters: PedidoFilter) => void;
  setPage: (page: number) => void;
  refresh: () => void;
};

export function usePedidos(): UsePedidosReturn {
  const [pedidos, setPedidos] = useState<PedidoListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<PedidoFilter>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await pedidosService.list(filters, page);
      setPedidos(result.data ?? []);
      setTotal(result.total ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch {
      setError('Não foi possível carregar os pedidos.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  return { pedidos, total, page, totalPages, isLoading, error, filters, setFilters, setPage, refresh: load };
}
