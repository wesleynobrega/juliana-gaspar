'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api-client';
import { Phone } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tags: string[];
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      const res = await api.get<{ data: Customer[] }>(`/customers?${params.toString()}`);
      setClientes(res.data ?? []);
    } catch {
      setError('Não foi possível carregar os clientes.');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Clientes</h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Clientes</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          {error}
        </div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Clientes</h1>

      <Input
        placeholder="Buscar clientes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm min-h-[48px] mb-6"
      />

      {clientes.length === 0 ? (
        <EmptyState title="Nenhum cliente" description="Nenhum cliente cadastrado ainda." />
      ) : (
        <div className="space-y-3">
          {clientes.map((c) => (
            <Card key={c.id} className="border-primary-100 min-h-[88px]">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-primary-900">{c.name}</h3>
                  {c.phone && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Phone className="w-3 h-3" />
                      {c.phone}
                    </Badge>
                  )}
                </div>
                {c.email && <p className="text-xs text-primary-400">{c.email}</p>}
                {c.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {c.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
