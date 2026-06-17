'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Cycle {
  id: string;
  status: string;
  openDate: string;
  closeDate: string;
  deliveryDate: string;
  orderCount?: number;
  revenue?: number;
  cycleDishes?: { id: string }[];
}

export default function CiclosPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: Cycle[] }>('/cycles?limit=50');
      setCycles(res.data ?? []);
    } catch {
      setError('Não foi possível carregar os ciclos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    OPEN: 'bg-green-100 text-green-800',
    CLOSED: 'bg-yellow-100 text-yellow-800',
    FINISHED: 'bg-blue-100 text-blue-800',
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Ciclos Semanais</h1>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Ciclos Semanais</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          {error}
        </div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Ciclos Semanais</h1>

      {cycles.length === 0 ? (
        <EmptyState title="Nenhum ciclo" description="Crie o primeiro ciclo semanal." />
      ) : (
        <div className="space-y-3">
          {cycles.map((c) => (
            <Card key={c.id} className="border-primary-100">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-primary-900">
                    {formatDate(c.openDate)} — {formatDate(c.closeDate)}
                  </h3>
                  <Badge className={`text-xs ${statusColor[c.status] ?? 'bg-gray-100'}`}>
                    {c.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-primary-400">
                  <span>Entrega: {formatDate(c.deliveryDate)}</span>
                  <span>
                    {c.orderCount ?? 0} pedidos{' '}
                    {c.revenue != null && `· ${formatCurrency(c.revenue)}`}
                  </span>
                </div>
                <p className="text-xs text-primary-400">
                  {c.cycleDishes?.length ?? 0} pratos no cardápio
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
