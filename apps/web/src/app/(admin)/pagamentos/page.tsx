'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_STATUS_LABELS } from '@/lib/constants';
import { Trash2, Eye, CreditCard, Clock, CheckCircle2, Package, User, RotateCcw } from 'lucide-react';

interface PaymentOrder {
  id: string;
  customer?: { name: string };
  totalAmount: number;
  items?: Array<{ dishName: string; quantity: number; unitPrice: number }>;
  deliveryDate?: string;
  status?: string;
}

interface Payment {
  id: string;
  method: string;
  amount: number;
  status: string;
  paidAt?: string | null;
  createdAt: string;
  refundReason?: string;
  refundedAt?: string;
  order?: PaymentOrder;
}

const colorByStatus: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  OVERDUE: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function PagamentosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);

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

  const handleRefund = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja reembolsar este pagamento?')) return;
    setIsRefunding(true);
    try {
      await api.post(`/payments/${id}/refund`, { reason: 'Reembolso solicitado' });
      toast.success('Pagamento reembolsado!');
      load();
    } catch {
      toast.error('Erro ao reembolsar pagamento.');
    } finally {
      setIsRefunding(false);
    }
  };

  const handleDelete = async (payment: Payment) => {
    if (!window.confirm(`Tem certeza que deseja excluir este pagamento de ${formatCurrency(payment.amount)}?`)) return;
    try {
      await api.delete(`/payments/${payment.id}`);
      toast.success('Pagamento removido!');
      setSelected(null);
      load();
    } catch {
      toast.error('Erro ao remover pagamento.');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Pagamentos</h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[88px] rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Pagamentos</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
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
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-primary-900">
                    {p.order?.customer?.name ?? 'Cliente não identificado'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-primary-400">
                    <span>{p.method}</span>
                    <span>·</span>
                    <span>{formatCurrency(p.amount)}</span>
                    {p.order?.id && (
                      <>
                        <span>·</span>
                        <span className="font-mono">Pedido #{p.order.id.slice(0, 8)}</span>
                      </>
                    )}
                  </div>
                  {p.status === 'REFUNDED' && p.refundReason && (
                    <p className="text-xs text-gray-500 mt-0.5">Motivo: {p.refundReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={`text-xs ${colorByStatus[p.status] ?? ''}`}>
                    {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                  </Badge>
                  {p.status === 'PENDING' && (
                    <Button size="sm" onClick={() => handleRegister(p.id)} className="min-h-[36px] text-xs">
                      Registrar
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-500" onClick={() => setSelected(p)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(p)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">Detalhes do Pagamento</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-primary-500" />
                <div>
                  <h3 className="font-semibold text-primary-900">
                    {selected.order?.customer?.name ?? 'Cliente não identificado'}
                  </h3>
                  <p className="text-xs text-primary-400">
                    {selected.order?.id ? `Pedido #${selected.order.id.slice(0, 8)}` : 'Sem pedido vinculado'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-primary-100 divide-y divide-primary-50">
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-sm text-primary-500">Método</span>
                  <span className="text-sm font-medium">{selected.method}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-sm text-primary-500">Valor</span>
                  <span className="font-bold text-primary-900">{formatCurrency(selected.amount)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-sm text-primary-500">Status</span>
                  <Badge className={`text-xs ${colorByStatus[selected.status] ?? ''}`}>
                    {PAYMENT_STATUS_LABELS[selected.status] ?? selected.status}
                  </Badge>
                </div>
                {selected.paidAt && (
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-sm text-primary-500">Pago em</span>
                    <span className="text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" /> {formatDate(selected.paidAt)}
                    </span>
                  </div>
                )}
                {selected.refundedAt && (
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-sm text-primary-500">Reembolsado em</span>
                    <span className="text-sm flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 text-gray-500" /> {formatDate(selected.refundedAt)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-sm text-primary-500">Criado em</span>
                  <span className="text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary-400" /> {formatDate(selected.createdAt)}
                  </span>
                </div>
                {selected.order && (
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-sm text-primary-500 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Total do Pedido
                    </span>
                    <span className="font-medium">{formatCurrency(selected.order.totalAmount)}</span>
                  </div>
                )}
                {selected.refundReason && (
                  <div className="flex justify-between items-start px-4 py-2.5">
                    <span className="text-sm text-primary-500">Motivo do reembolso</span>
                    <span className="text-sm text-right max-w-[180px]">{selected.refundReason}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {selected.status === 'PENDING' && (
                  <Button className="flex-1 min-h-[44px] bg-primary-700 hover:bg-primary-600 text-white" onClick={() => { handleRegister(selected.id); setSelected(null); }}>
                    Registrar Pagamento
                  </Button>
                )}
                {selected.status === 'PAID' && (
                  <Button variant="outline" className="flex-1 min-h-[44px] text-amber-600" onClick={() => { handleRefund(selected.id); }} disabled={isRefunding}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Reembolsar
                  </Button>
                )}
                <Button variant="outline" className="flex-1 min-h-[44px] text-red-600" onClick={() => handleDelete(selected)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
