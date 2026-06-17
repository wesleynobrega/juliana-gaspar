'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PLAN_TYPE_LABELS } from '@/lib/constants';
import { pedidosService } from '../services/pedidos.service';
import { PedidoStatusBadge } from './pedido-status-badge';
import type { OrderDTO } from '@juliana-gaspar/contracts';

type Props = {
  pedidoId: string | null;
  onClose: () => void;
};

export function PedidoDetalhesSheet({ pedidoId, onClose }: Props) {
  const [pedido, setPedido] = useState<OrderDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!pedidoId) {
      setPedido(null);
      return;
    }
    setIsLoading(true);
    pedidosService
      .getById(pedidoId)
      .then(setPedido)
      .finally(() => setIsLoading(false));
  }, [pedidoId]);

  return (
    <Sheet open={!!pedidoId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-lg">Detalhes do Pedido</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-3 mt-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : pedido ? (
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="font-semibold text-primary-900">{pedido.customerName}</h3>
              <p className="text-sm text-primary-400">#{pedido.id.slice(0, 8)}</p>
            </div>

            <div className="space-y-3">
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
                <span className="text-sm font-medium">{PLAN_TYPE_LABELS[pedido.planType] ?? pedido.planType}</span>
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
                <span className="text-sm text-primary-500">Endereço</span>
                <span className="text-sm text-right max-w-[200px]">{pedido.deliveryAddress}</span>
              </div>
              {pedido.notes && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-primary-500">Observações</span>
                  <span className="text-sm text-right max-w-[200px]">{pedido.notes}</span>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-sm text-primary-900 mb-2">Itens</h4>
              <div className="space-y-2">
                {pedido.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b border-primary-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary-900">{item.dishName}</p>
                      <p className="text-xs text-primary-400">
                        {item.quantity}× {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-semibold text-sm">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full min-h-[48px]"
              onClick={() => {
                onClose();
                window.location.href = `/pedidos/${pedidoId}`;
              }}
            >
              Ver página completa
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
