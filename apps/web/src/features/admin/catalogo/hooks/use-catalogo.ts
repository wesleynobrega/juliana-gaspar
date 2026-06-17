'use client';

import { useState, useEffect, useCallback } from 'react';
import { catalogoService } from '../services/catalogo.service';
import type { PratoListItem } from '../types';

type UseCatalogoReturn = {
  pratos: PratoListItem[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  search: string;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
};

export function useCatalogo(): UseCatalogoReturn {
  const [pratos, setPratos] = useState<PratoListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await catalogoService.list(page, search || undefined);
      setPratos(result.data ?? []);
      setTotal(result.total ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch {
      setError('Não foi possível carregar o catálogo.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  return { pratos, total, page, totalPages, isLoading, error, search, setSearch, setPage, refresh: load };
}
