'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Repeat, Pause, Play, XCircle, Plus, Trash2, User } from 'lucide-react';

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativa',
  PAUSED: 'Pausada',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
};

const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

const PLAN_LABELS: Record<string, string> = {
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
};

interface Subscription {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  planType: string;
  status: string;
  startDate: string;
  nextRenewal: string;
  pausedUntil: string | null;
}

interface CustomerOption {
  id: string;
  name: string;
}

export default function AssinaturasPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({ customerId: '', planType: 'WEEKLY' });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      const res = await api.get<{ data: Subscription[] }>(`/subscriptions?${params.toString()}`);
      setSubscriptions(res.data ?? []);
    } catch {
      setError('Não foi possível carregar as assinaturas.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get<{ data: CustomerOption[] }>('/customers?limit=100')
      .then((r) => setCustomers(r.data ?? []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setForm({ customerId: '', planType: 'WEEKLY' });
    setSheetOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/subscriptions', form);
      toast.success('Assinatura criada com sucesso!');
      setSheetOpen(false);
      load();
    } catch {
      toast.error('Erro ao criar assinatura.');
    }
  };

  const handlePause = async (sub: Subscription) => {
    const until = window.prompt('Pausar até (data ISO, ex: 2026-07-01T00:00:00Z):');
    if (!until) return;
    try {
      await api.patch(`/subscriptions/${sub.id}/pause`, { pausedUntil: until });
      toast.success('Assinatura pausada!');
      load();
    } catch {
      toast.error('Erro ao pausar assinatura.');
    }
  };

  const handleResume = async (id: string) => {
    try {
      await api.patch(`/subscriptions/${id}/resume`, {});
      toast.success('Assinatura retomada!');
      load();
    } catch {
      toast.error('Erro ao retomar assinatura.');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta assinatura?')) return;
    try {
      await api.patch(`/subscriptions/${id}/cancel`, {});
      toast.success('Assinatura cancelada!');
      load();
    } catch {
      toast.error('Erro ao cancelar assinatura.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta assinatura?')) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      toast.success('Assinatura removida!');
      load();
    } catch {
      toast.error('Erro ao remover assinatura.');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Assinaturas</h1>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-[88px] rounded-xl" />))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Assinaturas</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">Assinaturas</h1>
        <Button onClick={openCreate} className="bg-primary-700 hover:bg-primary-600 text-white min-h-[44px]">
          <Plus className="w-4 h-4 mr-2" /> Nova Assinatura
        </Button>
      </div>

      <div className="mb-6 max-w-xs">
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="min-h-[48px]">
            <SelectValue placeholder="Filtrar por status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ACTIVE">Ativa</SelectItem>
            <SelectItem value="PAUSED">Pausada</SelectItem>
            <SelectItem value="CANCELLED">Cancelada</SelectItem>
            <SelectItem value="EXPIRED">Expirada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState title="Nenhuma assinatura" description="Nenhuma assinatura cadastrada ainda." />
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="border-primary-100">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-500" />
                    <h3 className="font-semibold text-sm text-primary-900">
                      {sub.customerName ?? sub.customerId.slice(0, 8)}
                    </h3>
                    {sub.customerPhone && (
                      <span className="text-xs text-primary-400">{sub.customerPhone}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`text-xs ${SUBSCRIPTION_STATUS_COLORS[sub.status]}`}>
                      {SUBSCRIPTION_STATUS_LABELS[sub.status] ?? sub.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {PLAN_LABELS[sub.planType] ?? sub.planType}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-primary-400">
                  <span>Início: {formatDate(sub.startDate)}</span>
                  {sub.status === 'ACTIVE' && <span>Renova: {formatDate(sub.nextRenewal)}</span>}
                  {sub.pausedUntil && <span className="text-amber-600">Pausada até: {formatDate(sub.pausedUntil)}</span>}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {sub.status === 'ACTIVE' && (
                    <Button variant="outline" size="sm" className="text-xs min-h-[36px] text-amber-600" onClick={() => handlePause(sub)}>
                      <Pause className="w-3 h-3 mr-1" /> Pausar
                    </Button>
                  )}
                  {sub.status === 'PAUSED' && (
                    <Button variant="outline" size="sm" className="text-xs min-h-[36px] text-green-600" onClick={() => handleResume(sub.id)}>
                      <Play className="w-3 h-3 mr-1" /> Retomar
                    </Button>
                  )}
                  {(sub.status === 'ACTIVE' || sub.status === 'PAUSED') && (
                    <Button variant="outline" size="sm" className="text-xs min-h-[36px] text-red-600" onClick={() => handleCancel(sub.id)}>
                      <XCircle className="w-3 h-3 mr-1" /> Cancelar
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-xs min-h-[36px] text-red-500" onClick={() => handleDelete(sub.id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">Nova Assinatura</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleCreate} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={form.customerId} onValueChange={(v) => v && setForm({ ...form, customerId: v })}>
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={form.planType} onValueChange={(v) => v && setForm({ ...form, planType: v })}>
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Semanal</SelectItem>
                  <SelectItem value="MONTHLY">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white" disabled={!form.customerId}>
              Criar Assinatura
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
