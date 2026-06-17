'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { PAYMENT_STATUS_LABELS } from '@/lib/constants';

interface Payment {
  id: string;
  method: string;
  amount: number;
  status: string;
  order?: {
    customer?: {
      name: string;
    };
  };
}

const variantByStatus: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PAID: 'default',
  PENDING: 'secondary',
  OVERDUE: 'destructive',
  REFUNDED: 'outline',
};

const colorByStatus: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800 hover:bg-green-100',
  PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  OVERDUE: 'bg-red-100 text-red-800 hover:bg-red-100',
  REFUNDED: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
};

export default function PagamentosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: Payment[] }>('/payments?limit=100');
      setPayments(res.data ?? []);
    } catch {
      setError('Não foi possível carregar os pagamentos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRegister = async (id: string) => {
    try {
      await api.patch(`/payments/${id}/register`, { paymentId: id });
      toast.success('Pagamento registrado!');
      load();
    } catch {
      toast.error('Erro ao registrar pagamento.');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Pagamentos</h1>
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
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Pagamentos</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          {error}
        </div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Pagamentos</h1>

      {payments.length === 0 ? (
        <EmptyState title="Nenhum pagamento" description="Nenhum pagamento registrado ainda." />
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id} className="border-primary-100 min-h-[88px]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-primary-900">
                      {p.order?.customer?.name ?? '—'}
                    </p>
                    <p className="text-xs text-primary-400">
                      {p.method} · {formatCurrency(p.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={variantByStatus[p.status]} className={`text-xs ${colorByStatus[p.status] ?? ''}`}>
                      {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                    </Badge>
                    {p.status === 'PENDING' && (
                      <Button size="sm" onClick={() => handleRegister(p.id)} className="min-h-[44px] text-xs">
                        Registrar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
