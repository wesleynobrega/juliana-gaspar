'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { Truck } from 'lucide-react';

interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  fee: number;
}

export default function EntregasPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: DeliveryZone[] }>('/delivery/zones');
      setZones(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      setError('Não foi possível carregar as zonas de entrega.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Entregas</h1>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Entregas</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          {error}
        </div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
          <Truck className="w-5 h-5 text-primary-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-primary-900">Entregas</h1>
      </div>

      <h2 className="font-semibold text-primary-800 mb-3">Zonas de entrega</h2>

      {zones.length === 0 ? (
        <EmptyState title="Nenhuma zona de entrega" description="Cadastre as zonas de entrega." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {zones.map((z) => (
            <Card key={z.id} className="border-primary-100 min-h-[88px]">
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-sm text-primary-900">{z.name}</h3>
                {z.description && (
                  <p className="text-xs text-primary-400 line-clamp-2">{z.description}</p>
                )}
                <Badge
                  variant={z.fee === 0 ? 'default' : 'outline'}
                  className={`text-xs ${z.fee === 0 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}`}
                >
                  {z.fee === 0 ? 'Grátis' : `Taxa: ${formatCurrency(z.fee)}`}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
