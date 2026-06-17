'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { PedidoStatusBadge } from '@/features/admin/pedidos/components/pedido-status-badge';
import { pedidosService } from '@/features/admin/pedidos/services/pedidos.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PLAN_TYPE_LABELS } from '@/lib/constants';
import type { OrderDTO } from '@juliana-gaspar/contracts';
import { ArrowLeft } from 'lucide-react';

export default function PedidoDetalhePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [pedido, setPedido] = useState<OrderDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    pedidosService
      .getById(orderId)
      .then(setPedido)
      .catch(() => setError('Pedido não encontrado.'))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handleStatusUpdate = async (status: string) => {
    if (!orderId) return;
    setIsUpdating(true);
    try {
      await pedidosService.updateStatus(orderId, status);
      setPedido((prev) => (prev ? { ...prev, status: status as OrderDTO['status'] } : prev));
      toast.success('Status atualizado com sucesso!');
    } catch {
      toast.error('Erro ao atualizar status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="text-center py-16">
        <p className="text-primary-400 mb-4">{error || 'Pedido não encontrado.'}</p>
        <Button variant="outline" onClick={() => router.push('/pedidos')}>
          Voltar para pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 min-h-[44px]">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">
        Pedido de {pedido.customerName}
      </h1>

      <Card className="mb-6 border-primary-100">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-500">Status</span>
            <PedidoStatusBadge status={pedido.status} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-500">Pagamento</span>
            <Badge variant="outline" className="text-xs">
              {PAYMENT_STATUS_LABELS[pedido.paymentStatus] ?? pedido.paymentStatus}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-500">Plano</span>
            <span className="text-sm font-medium">
              {PLAN_TYPE_LABELS[pedido.planType] ?? pedido.planType}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-500">Valor total</span>
            <span className="font-bold text-primary-900">{formatCurrency(pedido.totalAmount)}</span>
          </div>
          {pedido.deliveryDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-500">Entrega</span>
              <span className="text-sm">{formatDate(pedido.deliveryDate)}</span>
            </div>
          )}
          <div className="flex justify-between items-start">
            <span className="text-sm text-primary-500 pt-0.5">Endereço</span>
            <span className="text-sm text-right max-w-[220px]">{pedido.deliveryAddress}</span>
          </div>
          {pedido.notes && (
            <div className="flex justify-between items-start">
              <span className="text-sm text-primary-500">Observações</span>
              <span className="text-sm text-right max-w-[220px]">{pedido.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="font-display font-semibold text-primary-900 mb-3">Itens do pedido</h2>
      <div className="space-y-2 mb-6">
        {pedido.items.map((item) => (
          <Card key={item.id} className="border-primary-100">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm text-primary-900">{item.dishName}</p>
                <p className="text-xs text-primary-400">
                  {item.quantity}× {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <span className="font-semibold text-primary-900">
                {formatCurrency(item.quantity * item.unitPrice)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="font-display font-semibold text-primary-900 mb-3">Atualizar status</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <Button
            key={value}
            size="sm"
            variant={pedido.status === value ? 'default' : 'outline'}
            disabled={isUpdating || pedido.status === value}
            onClick={() => handleStatusUpdate(value)}
            className="text-xs min-h-[44px]"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
