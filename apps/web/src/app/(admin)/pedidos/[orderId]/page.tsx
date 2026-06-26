'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS, PLAN_TYPE_LABELS } from '@/lib/constants';
import type { OrderDTO } from '@juliana-gaspar/contracts';
import {
  ArrowLeft,
  Printer,
  Pencil,
  XCircle,
  RotateCcw,
  RefreshCw,
  Trash2,
  Package,
  Truck,
  MapPin,
  Clock,
  CreditCard,
  User,
} from 'lucide-react';

// ── Confirmation Dialog ────────────────────────────────

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant = 'destructive',
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: 'destructive' | 'default' | 'outline';
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary-900">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-h-[44px]">
            Cancelar
          </Button>
          <Button
            variant={confirmVariant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="min-h-[44px]"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ───────────────────────────────────────────────

export default function PedidoDetalhePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [pedido, setPedido] = useState<OrderDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editAddress, setEditAddress] = useState('');
  const [editDeliveryDate, setEditDeliveryDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({ title: '', description: '', confirmLabel: '', onConfirm: () => {} });

  useEffect(() => {
    if (!orderId) return;
    api
      .get<OrderDTO>(`/orders/${orderId}`)
      .then((data) => {
        setPedido(data);
        setEditAddress(data.deliveryAddress ?? '');
        setEditDeliveryDate(data.deliveryDate ? data.deliveryDate.split('T')[0] : '');
        setEditNotes(data.notes ?? '');
      })
      .catch(() => setError('Pedido não encontrado.'))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  // ── Actions ──────────────────────────────────────────

  const handleStatusUpdate = async (status: string) => {
    if (!orderId) return;
    setIsUpdating(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setPedido((prev) => (prev ? { ...prev, status: status as OrderDTO['status'] } : prev));
      toast.success('Status atualizado com sucesso!');
    } catch {
      toast.error('Erro ao atualizar status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setConfirmAction({
      title: 'Cancelar Pedido',
      description: 'Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.',
      confirmLabel: 'Sim, cancelar',
      onConfirm: () => handleStatusUpdate('CANCELLED'),
    });
    setConfirmOpen(true);
  };

  const handleRefund = async () => {
    if (!orderId) return;
    setIsUpdating(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' });
      await api.patch(`/payments/${orderId}/refund`, { reason: 'Reembolso solicitado pelo admin' });
      setPedido((prev) => (prev ? { ...prev, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : prev));
      toast.success('Pedido reembolsado com sucesso!');
    } catch {
      toast.error('Erro ao processar reembolso.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecalc = async () => {
    if (!orderId || !pedido) return;
    setIsUpdating(true);
    try {
      const items = pedido.items.map((i) => ({ dishId: i.dishId, quantity: i.quantity }));
      await api.put(`/orders/${orderId}/items`, { items });
      const updated = await api.get<OrderDTO>(`/orders/${orderId}`);
      setPedido(updated);
      toast.success('Pedido recalculado!');
    } catch {
      toast.error('Erro ao recalcular pedido.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    setConfirmAction({
      title: 'Excluir Pedido',
      description: 'Tem certeza que deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita.',
      confirmLabel: 'Sim, excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/orders/${orderId}`);
          toast.success('Pedido excluído!');
          router.push('/pedidos');
        } catch {
          toast.error('Erro ao excluir pedido.');
        }
      },
    });
    setConfirmOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!orderId) return;
    setIsUpdating(true);
    try {
      await api.put(`/orders/${orderId}`, {
        deliveryAddress: editAddress,
        deliveryDate: editDeliveryDate ? new Date(editDeliveryDate).toISOString() : null,
        notes: editNotes || null,
      });
      const updated = await api.get<OrderDTO>(`/orders/${orderId}`);
      setPedido(updated);
      setIsEditing(false);
      toast.success('Pedido atualizado!');
    } catch {
      toast.error('Erro ao atualizar pedido.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const styles = document.querySelector('style')?.outerHTML || '';
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Pedido #${orderId?.slice(0, 8) || ''} - Juliana Gaspar</title>
        ${styles}
        <style>
          body { font-family: sans-serif; padding: 2rem; color: #1E3B1A; }
          .header { border-bottom: 2px solid #2D5A27; padding-bottom: 1rem; margin-bottom: 1.5rem; }
          .header h1 { color: #2D5A27; font-size: 1.5rem; margin: 0; }
          .header p { color: #666; margin: 0.25rem 0; }
          table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
          th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #E1E8DB; }
          th { color: #4A7536; font-size: 0.75rem; text-transform: uppercase; }
          .total { font-size: 1.25rem; font-weight: bold; text-align: right; }
          .footer { margin-top: 2rem; font-size: 0.75rem; color: #999; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <div class="footer">Juliana Gaspar - Cozinha Afetiva &amp; Saudável</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  // ── Loading ──────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-3xl">
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
        <Button variant="outline" onClick={() => router.push('/pedidos')} className="min-h-[44px]">
          Voltar para pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <Button variant="ghost" onClick={() => router.back()} className="min-h-[44px]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="min-h-[40px] text-xs" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5 mr-1" /> Imprimir
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[40px] text-xs"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
          </Button>
          <Button variant="outline" size="sm" className="min-h-[40px] text-xs" onClick={handleCancel}>
            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelar
          </Button>
          <Button variant="outline" size="sm" className="min-h-[40px] text-xs text-amber-600" onClick={handleRefund}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reembolsar
          </Button>
          <Button variant="outline" size="sm" className="min-h-[40px] text-xs" onClick={handleRecalc}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Recalcular
          </Button>
          <Button variant="outline" size="sm" className="min-h-[40px] text-xs text-red-600" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir
          </Button>
        </div>
      </div>

      {/* Print content */}
      <div ref={printRef}>
        <div className="header-section" style={{ borderBottom: '2px solid #2D5A27', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ color: '#2D5A27', fontSize: '1.5rem', margin: 0 }}>Pedido de {pedido.customerName}</h1>
          <p style={{ color: '#666', margin: '0.25rem 0' }}>#{pedido.id.slice(0, 8)}</p>
          <p style={{ color: '#666', margin: '0.25rem 0' }}>
            Criado em: {formatDate(pedido.createdAt)}
          </p>
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">
        Pedido de {pedido.customerName}
      </h1>

      {/* Edit form */}
      {isEditing && (
        <Card className="mb-6 border-primary-200 bg-primary-50/30">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-primary-900">Editar pedido</h3>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Endereço de entrega</Label>
              <Input
                id="edit-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="min-h-[48px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Data de entrega</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDeliveryDate}
                onChange={(e) => setEditDeliveryDate(e.target.value)}
                className="min-h-[48px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} disabled={isUpdating} className="min-h-[44px]">
                {isUpdating ? 'Salvando...' : 'Salvar alterações'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="min-h-[44px]">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order info */}
      <Card className="mb-6 border-primary-100">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Cliente
            </span>
            <span className="text-sm font-medium">{pedido.customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-500">Status</span>
            <Badge className={`text-xs ${ORDER_STATUS_COLORS[pedido.status] || ''}`}>
              {ORDER_STATUS_LABELS[pedido.status] || pedido.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Pagamento
            </span>
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
            <span className="font-bold text-primary-900 text-lg">{formatCurrency(pedido.totalAmount)}</span>
          </div>
          {pedido.deliveryDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-500 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Entrega
              </span>
              <span className="text-sm">{formatDate(pedido.deliveryDate)}</span>
            </div>
          )}
          <div className="flex justify-between items-start">
            <span className="text-sm text-primary-500 flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5" /> Endereço
            </span>
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

      {/* Items */}
      <h2 className="font-display font-semibold text-lg text-primary-900 mb-3 flex items-center gap-1.5">
        <Package className="w-4 h-4" /> Itens do pedido
      </h2>
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

      {/* Status buttons */}
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction.title}
        description={confirmAction.description}
        confirmLabel={confirmAction.confirmLabel}
        onConfirm={confirmAction.onConfirm}
      />
    </div>
  );
}
