'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/lib/constants';
import {
  Trash2, Eye, CreditCard, Clock, CheckCircle2, Package, User, RotateCcw,
  Plus, Pencil, Search, X,
} from 'lucide-react';

// ---- types ----

interface OrderSummary {
  id: string;
  customer?: { name: string };
  totalAmount: number;
  items?: Array<{ dishName: string; quantity: number; unitPrice: number }>;
  deliveryDate?: string;
  status?: string;
}

interface Payment {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  status: string;
  paidAt?: string | null;
  createdAt: string;
  refundReason?: string;
  refundedAt?: string;
  order?: OrderSummary;
}

// ---- constants ----

const METHOD_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão de Crédito',
  PAYMENT_LINK: 'Link de Pagamento',
};

const PAYMENT_METHOD_OPTIONS = ['PIX', 'CREDIT_CARD', 'PAYMENT_LINK'] as const;
const PAYMENT_STATUS_OPTIONS = ['PENDING', 'PAID', 'OVERDUE', 'REFUNDED'] as const;

// ---- page ----

export default function PagamentosPage() {
  // list
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // detail / edit sheet
  const [selected, setSelected] = useState<Payment | null>(null);
  const [editing, setEditing] = useState(false);
  const [editMethod, setEditMethod] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  // create sheet
  const [createOpen, setCreateOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderResults, setOrderResults] = useState<OrderSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [newMethod, setNewMethod] = useState('PIX');
  const [newAmount, setNewAmount] = useState('');
  const [creating, setCreating] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- load ----

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (methodFilter !== 'all') params.set('method', methodFilter);
      const res = await api.get<{ data: Payment[] }>(`/payments?${params.toString()}`);
      setPayments(res.data ?? []);
    } catch {
      setError('Não foi possível carregar os pagamentos.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, methodFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- actions ----

  const handleRegister = async (id: string) => {
    try {
      await api.patch(`/payments/${id}/register`, { paymentId: id });
      toast.success('Pagamento registrado!');
      setSelected(null);
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
      setSelected(null);
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

  // ---- create ----

  const searchOrders = useCallback(async (q: string) => {
    if (q.length < 2) {
      setOrderResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get<{ data: OrderSummary[] }>(`/orders?search=${encodeURIComponent(q)}&limit=10`);
      setOrderResults(res.data ?? []);
    } catch {
      setOrderResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleOrderSearchChange = (value: string) => {
    setOrderSearch(value);
    setSelectedOrder(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchOrders(value), 400);
  };

  const handleCreate = async () => {
    if (!selectedOrder) { toast.error('Selecione um pedido.'); return; }
    const amount = parseFloat(newAmount);
    if (!newAmount || isNaN(amount) || amount <= 0) { toast.error('Informe um valor válido.'); return; }
    setCreating(true);
    try {
      await api.post('/payments', { orderId: selectedOrder.id, method: newMethod, amount });
      toast.success('Pagamento criado!');
      resetCreateForm();
      setCreateOpen(false);
      load();
    } catch {
      toast.error('Erro ao criar pagamento.');
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setOrderSearch('');
    setOrderResults([]);
    setSelectedOrder(null);
    setNewMethod('PIX');
    setNewAmount('');
  };

  // ---- edit ----

  const startEditing = () => {
    if (!selected) return;
    setEditMethod(selected.method);
    setEditAmount(String(selected.amount));
    setEditStatus(selected.status);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const amount = parseFloat(editAmount);
    if (!editAmount || isNaN(amount) || amount <= 0) { toast.error('Informe um valor válido.'); return; }
    setSaving(true);
    try {
      const updated = await api.put<Payment>(`/payments/${selected.id}`, {
        method: editMethod,
        amount,
        status: editStatus,
      });
      toast.success('Pagamento atualizado!');
      setSelected(updated);
      setEditing(false);
      load();
    } catch {
      toast.error('Erro ao atualizar pagamento.');
    } finally {
      setSaving(false);
    }
  };

  // ---- render ----

  const badgeColor = (status: string) => PAYMENT_STATUS_COLORS[status] ?? '';

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
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">Pagamentos</h1>
        <Button
          className="bg-primary-700 hover:bg-primary-600 text-white min-h-[40px]"
          onClick={() => { resetCreateForm(); setCreateOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Pagamento
        </Button>
      </div>

      {/* filters */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger size="sm" className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v ?? 'all')}>
          <SelectTrigger size="sm" className="w-[180px]">
            <SelectValue placeholder="Método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os métodos</SelectItem>
            {PAYMENT_METHOD_OPTIONS.map((m) => (
              <SelectItem key={m} value={m}>{METHOD_LABELS[m]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(statusFilter !== 'all' || methodFilter !== 'all') && (
          <span className="text-xs text-primary-400">
            {payments.length} resultado{payments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* list */}
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
                    <span>{METHOD_LABELS[p.method] ?? p.method}</span>
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
                  <Badge className={`text-xs ${badgeColor(p.status)}`}>
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

      {/* ---- detail / edit sheet ---- */}
      <Sheet open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setEditing(false); } }}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">
              {editing ? 'Editar Pagamento' : 'Detalhes do Pagamento'}
            </SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-5">
              {/* customer info */}
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

              {/* fields */}
              <div className="bg-white rounded-lg border border-primary-100 divide-y divide-primary-50">
                {/* method */}
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-sm text-primary-500">Método</span>
                  {editing ? (
                    <Select value={editMethod} onValueChange={(v) => setEditMethod(v ?? 'PIX')}>
                      <SelectTrigger size="sm" className="w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHOD_OPTIONS.map((m) => (
                          <SelectItem key={m} value={m}>{METHOD_LABELS[m]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm font-medium">{METHOD_LABELS[selected.method] ?? selected.method}</span>
                  )}
                </div>

                {/* amount */}
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-sm text-primary-500">Valor</span>
                  {editing ? (
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-[140px] text-right"
                    />
                  ) : (
                    <span className="font-bold text-primary-900">{formatCurrency(selected.amount)}</span>
                  )}
                </div>

                {/* status */}
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-sm text-primary-500">Status</span>
                  {editing ? (
                    <Select value={editStatus} onValueChange={(v) => setEditStatus(v ?? 'PENDING')}>
                      <SelectTrigger size="sm" className="w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`text-xs ${badgeColor(selected.status)}`}>
                      {PAYMENT_STATUS_LABELS[selected.status] ?? selected.status}
                    </Badge>
                  )}
                </div>

                {!editing && selected.paidAt && (
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-sm text-primary-500">Pago em</span>
                    <span className="text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" /> {formatDate(selected.paidAt)}
                    </span>
                  </div>
                )}
                {!editing && selected.refundedAt && (
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-sm text-primary-500">Reembolsado em</span>
                    <span className="text-sm flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 text-gray-500" /> {formatDate(selected.refundedAt)}
                    </span>
                  </div>
                )}
                {!editing && (
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-sm text-primary-500">Criado em</span>
                    <span className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary-400" /> {formatDate(selected.createdAt)}
                    </span>
                  </div>
                )}
                {!editing && selected.order && (
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-sm text-primary-500 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Total do Pedido
                    </span>
                    <span className="font-medium">{formatCurrency(selected.order.totalAmount)}</span>
                  </div>
                )}
                {!editing && selected.refundReason && (
                  <div className="flex justify-between items-start px-4 py-2.5">
                    <span className="text-sm text-primary-500">Motivo do reembolso</span>
                    <span className="text-sm text-right max-w-[180px]">{selected.refundReason}</span>
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="flex gap-2 pt-2">
                {editing ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 min-h-[44px]"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 min-h-[44px] bg-primary-700 hover:bg-primary-600 text-white"
                      onClick={handleUpdate}
                      disabled={saving}
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 min-h-[44px]"
                      onClick={startEditing}
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Editar
                    </Button>
                    {selected.status === 'PENDING' && (
                      <Button
                        className="flex-1 min-h-[44px] bg-primary-700 hover:bg-primary-600 text-white"
                        onClick={() => { handleRegister(selected.id); }}
                      >
                        Registrar
                      </Button>
                    )}
                    {selected.status === 'PAID' && (
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px] text-amber-600"
                        onClick={() => handleRefund(selected.id)}
                        disabled={isRefunding}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" /> Reembolsar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="flex-1 min-h-[44px] text-red-600"
                      onClick={() => handleDelete(selected)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ---- create sheet ---- */}
      <Sheet open={createOpen} onOpenChange={(open) => { if (!open) { setCreateOpen(false); resetCreateForm(); } }}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">Novo Pagamento</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            {/* order search */}
            <div className="space-y-2">
              <Label className="text-sm text-primary-700">Pedido</Label>
              {selectedOrder ? (
                <div className="flex items-center justify-between bg-white rounded-lg border border-primary-100 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-primary-900">
                      {selectedOrder.customer?.name ?? 'Cliente não identificado'}
                    </p>
                    <p className="text-xs text-primary-400">
                      Pedido #{selectedOrder.id.slice(0, 8)} · {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-primary-400"
                    onClick={() => { setSelectedOrder(null); setOrderSearch(''); setOrderResults([]); }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400" />
                    <Input
                      placeholder="Buscar pedido por cliente..."
                      value={orderSearch}
                      onChange={(e) => handleOrderSearchChange(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {searching && <p className="text-xs text-primary-400">Buscando...</p>}
                  {!searching && orderResults.length > 0 && (
                    <div className="bg-white rounded-lg border border-primary-100 divide-y divide-primary-50 max-h-[200px] overflow-y-auto">
                      {orderResults.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-primary-50 transition-colors"
                          onClick={() => { setSelectedOrder(o); setOrderSearch(''); setOrderResults([]); }}
                        >
                          <p className="text-sm font-medium text-primary-900">
                            {o.customer?.name ?? 'Cliente não identificado'}
                          </p>
                          <p className="text-xs text-primary-400">
                            Pedido #{o.id.slice(0, 8)} · {formatCurrency(o.totalAmount)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                  {!searching && orderSearch.length >= 2 && orderResults.length === 0 && (
                    <p className="text-xs text-primary-400">Nenhum pedido encontrado.</p>
                  )}
                </div>
              )}
            </div>

            {/* method */}
            <div className="space-y-2">
              <Label className="text-sm text-primary-700">Método de pagamento</Label>
              <Select value={newMethod} onValueChange={(v) => setNewMethod(v ?? 'PIX')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>{METHOD_LABELS[m]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* amount */}
            <div className="space-y-2">
              <Label className="text-sm text-primary-700">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
              {selectedOrder && (
                <p className="text-xs text-primary-400">
                  Total do pedido: {formatCurrency(selectedOrder.totalAmount)}
                </p>
              )}
            </div>

            {/* create button */}
            <Button
              className="w-full min-h-[44px] bg-primary-700 hover:bg-primary-600 text-white"
              onClick={handleCreate}
              disabled={creating || !selectedOrder}
            >
              {creating ? 'Criando...' : 'Criar Pagamento'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
