'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Trash2, Settings, ArrowRight } from 'lucide-react';

interface CycleDishRef {
  dishId: string;
  dish?: { id: string; name: string; price: number };
}

interface Cycle {
  id: string;
  status: string;
  openDate: string;
  closeDate: string;
  deliveryDate: string;
  orderCount?: number;
  revenue?: number;
  cycleDishes?: CycleDishRef[];
}

interface DishOption {
  id: string;
  name: string;
  price: number;
}

const statusColor: Record<string, string> = {
  UPCOMING: 'bg-gray-100 text-gray-800',
  OPEN: 'bg-green-100 text-green-800',
  CLOSED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
};

const statusLabel: Record<string, string> = {
  UPCOMING: 'Agendado',
  OPEN: 'Aberto',
  CLOSED: 'Fechado',
  COMPLETED: 'Concluído',
};

const nextStatus: Record<string, string | null> = {
  UPCOMING: 'OPEN',
  OPEN: 'CLOSED',
  CLOSED: 'COMPLETED',
  COMPLETED: null,
};

const nextLabel: Record<string, string> = {
  UPCOMING: 'Abrir',
  OPEN: 'Fechar',
  CLOSED: 'Concluir',
};

export default function CiclosPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [dishes, setDishes] = useState<DishOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manageCycle, setManageCycle] = useState<Cycle | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());

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

  useEffect(() => { load(); }, []);

  useEffect(() => {
    api.get<{ data: DishOption[] }>('/dishes?limit=100')
      .then((r) => setDishes(r.data ?? []))
      .catch(() => {});
  }, []);

  const handleDelete = async (cycle: Cycle) => {
    if (!window.confirm('Tem certeza que deseja excluir este ciclo?')) return;
    try {
      await api.delete(`/cycles/${cycle.id}`);
      toast.success('Ciclo removido!');
      load();
    } catch {
      toast.error('Erro ao remover ciclo.');
    }
  };

  const handleStatusTransition = async (cycle: Cycle) => {
    const target = nextStatus[cycle.status];
    if (!target) return;
    try {
      await api.patch(`/cycles/${cycle.id}/status`, { status: target });
      toast.success(`Ciclo ${nextLabel[cycle.status].toLowerCase()} com sucesso!`);
      load();
    } catch {
      toast.error('Erro ao alterar status do ciclo.');
    }
  };

  const openManage = (cycle: Cycle) => {
    setManageCycle(cycle);
    const ids = new Set<string>((cycle.cycleDishes ?? []).map((cd) => cd.dishId));
    setSelectedDishes(ids);
  };

  const handleSaveDishes = async () => {
    if (!manageCycle) return;
    try {
      await api.put(`/cycles/${manageCycle.id}/dishes`, { dishIds: Array.from(selectedDishes) });
      toast.success('Pratos do ciclo atualizados!');
      setManageCycle(null);
      load();
    } catch {
      toast.error('Erro ao atualizar pratos do ciclo.');
    }
  };

  const toggleDish = (dishId: string) => {
    const next = new Set(selectedDishes);
    if (next.has(dishId)) next.delete(dishId);
    else next.add(dishId);
    setSelectedDishes(next);
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
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
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-sm text-primary-900">
                    {formatDate(c.openDate)} — {formatDate(c.closeDate)}
                  </h3>
                  <Badge className={`text-xs ${statusColor[c.status] ?? 'bg-gray-100'}`}>
                    {statusLabel[c.status] ?? c.status}
                  </Badge>
                </div>

                <div className="flex justify-between text-xs text-primary-400">
                  <span>Entrega: {formatDate(c.deliveryDate)}</span>
                  <span>{c.orderCount ?? 0} pedidos{c.revenue != null && ` · ${formatCurrency(c.revenue)}`}</span>
                </div>

                <p className="text-xs text-primary-400">{c.cycleDishes?.length ?? 0} pratos no cardápio</p>

                <div className="flex gap-2 flex-wrap pt-1">
                  {nextStatus[c.status] && (
                    <Button size="sm" variant="outline" className="text-xs min-h-[36px]" onClick={() => handleStatusTransition(c)}>
                      <ArrowRight className="w-3 h-3 mr-1" /> {nextLabel[c.status]}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-xs min-h-[36px]" onClick={() => openManage(c)}>
                    <Settings className="w-3 h-3 mr-1" /> Gerenciar Pratos
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs min-h-[36px] text-red-500" onClick={() => handleDelete(c)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!manageCycle} onOpenChange={(open) => !open && setManageCycle(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">Gerenciar Pratos do Ciclo</SheetTitle>
          </SheetHeader>
          {manageCycle && (
            <div className="mt-6 space-y-5">
              <p className="text-sm text-primary-400">
                Ciclo: {formatDate(manageCycle.openDate)} — {formatDate(manageCycle.closeDate)}
              </p>
              <div className="space-y-3">
                {dishes.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 py-2 border-b border-primary-50">
                    <Checkbox id={`dish-${d.id}`} checked={selectedDishes.has(d.id)} onCheckedChange={() => toggleDish(d.id)} />
                    <Label htmlFor={`dish-${d.id}`} className="text-sm cursor-pointer flex-1">{d.name}</Label>
                    <span className="text-xs text-primary-400">{formatCurrency(d.price ?? 0)}</span>
                  </div>
                ))}
              </div>
              {dishes.length === 0 && <p className="text-sm text-primary-400">Nenhum prato disponível.</p>}
              <Button onClick={handleSaveDishes} className="w-full min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white">
                Salvar Pratos
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
