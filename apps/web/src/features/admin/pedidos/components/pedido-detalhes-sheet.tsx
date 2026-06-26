'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS, PLAN_TYPE_LABELS } from '@/lib/constants';
import { pedidosService } from '../services/pedidos.service';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { PedidoStatusBadge } from './pedido-status-badge';
import type { OrderDTO } from '@juliana-gaspar/contracts';
import { Pencil, XCircle, RotateCcw, RefreshCw, Trash2, Printer } from 'lucide-react';

type Props = {
  pedidoId: string | null;
  onClose: () => void;
  onRefresh?: () => void;
};

export function PedidoDetalhesSheet({ pedidoId, onClose, onRefresh }: Props) {
  const [pedido, setPedido] = useState<OrderDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!pedidoId) {
      setPedido(null);
      return;
    }
    setIsLoading(true);
    pedidosService
      .getById(pedidoId)
      .then(setPedido)
      .catch(() => toast.error('Erro ao carregar pedido.'))
      .finally(() => setIsLoading(false));
  }, [pedidoId]);

  const handleStatusUpdate = async (status: string) => {
    if (!pedidoId) return;
    setIsUpdating(true);
    try {
      await api.patch(`/orders/${pedidoId}/status`, { status });
      setPedido((prev) => (prev ? { ...prev, status: status as OrderDTO['status'] } : prev));
      toast.success('Status atualizado!');
      onRefresh?.();
    } catch {
      toast.error('Erro ao atualizar status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) return;
    await handleStatusUpdate('CANCELLED');
  };

  const handleRefund = async () => {
    if (!pedidoId) return;
    if (!window.confirm('Tem certeza que deseja reembolsar este pedido?')) return;
    setIsUpdating(true);
    try {
      await api.patch(`/orders/${pedidoId}/status`, { status: 'CANCELLED' });
      await api.post(`/payments/${pedidoId}/refund`, { reason: 'Reembolso solicitado pelo admin' });
      setPedido((prev) => (prev ? { ...prev, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : prev));
      toast.success('Pedido reembolsado!');
      onRefresh?.();
    } catch {
      toast.error('Erro ao processar reembolso.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecalc = async () => {
    if (!pedidoId || !pedido) return;
    setIsUpdating(true);
    try {
      const items = pedido.items.map((i) => ({ dishId: i.dishId, quantity: i.quantity }));
      await api.put(`/orders/${pedidoId}/items`, { items });
      const updated = await api.get<OrderDTO>(`/orders/${pedidoId}`);
      setPedido(updated);
      toast.success('Pedido recalculado!');
      onRefresh?.();
    } catch {
      toast.error('Erro ao recalcular pedido.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!pedidoId) return;
    if (!window.confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) return;
    try {
      await api.delete(`/orders/${pedidoId}`);
      toast.success('Pedido removido!');
      onClose();
      onRefresh?.();
    } catch {
      toast.error('Erro ao remover pedido.');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow || !pedido) return;
    const itemsHtml = pedido.items.map(i =>
      `<tr><td>${i.dishName}</td><td>${i.quantity}</td><td>${formatCurrency(i.unitPrice)}</td><td>${formatCurrency(i.quantity * i.unitPrice)}</td></tr>`
    ).join('');
    printWindow.document.write(`
      <!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Pedido - Juliana Gaspar</title>
      <style>body{font-family:sans-serif;padding:2rem;color:#1E3B1A} .header{border-bottom:2px solid #2D5A27;padding-bottom:1rem;margin-bottom:1.5rem} h1{color:#2D5A27} table{width:100%;border-collapse:collapse} th,td{text-align:left;padding:.5rem;border-bottom:1px solid #E1E8DB} th{color:#4A7536} .total{font-size:1.25rem;font-weight:bold;text-align:right} @media print{body{padding:0}}</style></head>
      <body><div class="header"><h1>Pedido de ${pedido.customerName}</h1><p>#${pedido.id.slice(0,8)} | ${formatDate(pedido.createdAt)}</p><p>Status: ${ORDER_STATUS_LABELS[pedido.status]}</p><p>Entrega: ${pedido.deliveryDate ? formatDate(pedido.deliveryDate) : '—'} | ${pedido.deliveryAddress || '—'}</p></div>
      <table><thead><tr><th>Item</th><th>Qtd</th><th>Unit</th><th>Subtotal</th></tr></thead><tbody>${itemsHtml}</tbody></table>
      <p class="total">Total: ${formatCurrency(pedido.totalAmount)}</p>
      <p style="text-align:center;margin-top:2rem;color:#999;font-size:.75rem">Juliana Gaspar - Cozinha Afetiva & Saudável</p></body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <Sheet open={!!pedidoId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-lg text-primary-900">Detalhes do Pedido</SheetTitle>
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
                <span className="font-bold text-primary-900 text-lg">{formatCurrency(pedido.totalAmount)}</span>
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
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-primary-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-primary-900">{item.dishName}</p>
                      <p className="text-xs text-primary-400">{item.quantity}× {formatCurrency(item.unitPrice)}</p>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(item.quantity * item.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h4 className="font-semibold text-sm text-primary-900 mb-2">Ações</h4>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="text-xs min-h-[40px]" onClick={handlePrint}>
                  <Printer className="w-3.5 h-3.5 mr-1" /> Imprimir
                </Button>
                <Button
                  size="sm" variant="outline" className="text-xs min-h-[40px]"
                  onClick={() => { onClose(); window.location.href = `/pedidos/${pedidoId}`; }}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="outline" className="text-xs min-h-[40px]" onClick={handleCancel} disabled={isUpdating}>
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelar
                </Button>
                <Button size="sm" variant="outline" className="text-xs min-h-[40px] text-amber-600" onClick={handleRefund} disabled={isUpdating}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reembolsar
                </Button>
                <Button size="sm" variant="outline" className="text-xs min-h-[40px]" onClick={handleRecalc} disabled={isUpdating}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Recalcular
                </Button>
                <Button size="sm" variant="outline" className="text-xs min-h-[40px] text-red-600" onClick={handleDelete}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
