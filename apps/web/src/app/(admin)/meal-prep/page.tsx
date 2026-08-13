'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, MapPin, CalendarClock } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  MEAL_PREP_STATUS_LABELS,
  MEAL_PREP_STATUS_COLORS,
  MEAL_PREP_LOCAL_LABELS,
} from '@/lib/constants';

interface Cliente {
  id: string;
  name: string;
}

interface PlanoAlimentar {
  id: string;
  clienteId: string;
  description: string;
}

interface MealPrepSession {
  id: string;
  clienteId: string;
  mealPlanId: string;
  clienteName: string | null;
  mealPlanDescription: string | null;
  date: string;
  location: string;
  mealCount: number | null;
  durationHours: number | null;
  status: string;
  groceryService: boolean;
  totalValue: number;
  notes: string | null;
}

interface MealPrepFormData {
  clienteId: string;
  mealPlanId: string;
  date: string;
  location: string;
  mealCount: string;
  durationHours: string;
  groceryService: boolean;
  notes: string;
  status: string;
}

const emptyForm: MealPrepFormData = {
  clienteId: '',
  mealPlanId: '',
  date: '',
  location: 'CASA_CLIENTE',
  mealCount: '',
  durationHours: '',
  groceryService: false,
  notes: '',
  status: 'AGENDADO',
};

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sessionToForm(s: MealPrepSession): MealPrepFormData {
  return {
    clienteId: s.clienteId,
    mealPlanId: s.mealPlanId,
    date: toLocalInput(s.date),
    location: s.location,
    mealCount: s.mealCount?.toString() ?? '',
    durationHours: s.durationHours?.toString() ?? '',
    groceryService: s.groceryService,
    notes: s.notes ?? '',
    status: s.status,
  };
}

export default function MealPrepPage() {
  const [sessions, setSessions] = useState<MealPrepSession[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [planos, setPlanos] = useState<PlanoAlimentar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MealPrepFormData>(emptyForm);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sessionsRes, clientesRes, planosRes] = await Promise.all([
        api.get<{ data: MealPrepSession[] }>('/meal-prep-sessions?limit=100'),
        api.get<{ data: Cliente[] }>('/clients?limit=100'),
        api.get<{ data: PlanoAlimentar[] }>('/meal-plans?limit=100'),
      ]);
      setSessions(sessionsRes.data ?? []);
      setClientes(clientesRes.data ?? []);
      setPlanos(planosRes.data ?? []);
    } catch {
      setError('Não foi possível carregar as sessões de meal prep.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (s: MealPrepSession) => {
    setEditingId(s.id);
    setForm(sessionToForm(s));
    setSheetOpen(true);
  };

  const planosDoCliente = planos.filter((p) => p.clienteId === form.clienteId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      clienteId: form.clienteId,
      mealPlanId: form.mealPlanId,
      date: new Date(form.date).toISOString(),
      location: form.location,
      mealCount: form.mealCount ? parseInt(form.mealCount, 10) : null,
      durationHours: form.durationHours ? parseInt(form.durationHours, 10) : null,
      groceryService: form.groceryService,
      notes: form.notes || null,
      ...(editingId ? { status: form.status } : {}),
    };
    try {
      if (editingId) {
        await api.put(`/meal-prep-sessions/${editingId}`, payload);
        toast.success('Sessão atualizada com sucesso!');
      } else {
        await api.post('/meal-prep-sessions', payload);
        toast.success('Sessão agendada com sucesso!');
      }
      setSheetOpen(false);
      load();
    } catch {
      toast.error('Erro ao salvar sessão. Tente novamente.');
    }
  };

  const handleDelete = async (s: MealPrepSession) => {
    if (!window.confirm(`Tem certeza que deseja excluir a sessão de "${s.clienteName ?? 'cliente'}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/meal-prep-sessions/${s.id}`);
      toast.success('Sessão removida com sucesso!');
      load();
    } catch {
      toast.error('Erro ao remover sessão.');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Meal Prep</h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-[88px] rounded-xl" />))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Meal Prep</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">Meal Prep</h1>
        <Button onClick={openCreate} className="bg-primary-700 hover:bg-primary-600 text-white min-h-[44px]">
          <Plus className="w-4 h-4 mr-2" /> Nova Sessão
        </Button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState title="Nenhuma sessão" description="Agende uma sessão de meal prep." />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id} className="border-primary-100">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-primary-900">{s.clienteName ?? 'Cliente'}</h3>
                    <Badge className={`text-xs ${MEAL_PREP_STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-800'}`}>
                      {MEAL_PREP_STATUS_LABELS[s.status] || s.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="w-3 h-3" />
                      {formatDate(s.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {MEAL_PREP_LOCAL_LABELS[s.location] ?? s.location}
                    </span>
                    {s.mealCount != null && <span>• {s.mealCount} refeições</span>}
                    {s.groceryService && <span>• Com compras</span>}
                  </div>
                  {s.mealPlanDescription && (
                    <p className="text-xs text-primary-500 line-clamp-1">{s.mealPlanDescription}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-primary-700">{formatCurrency(s.totalValue)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-500 hover:text-primary-700" onClick={() => openEdit(s)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(s)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">
              {editingId ? 'Editar Sessão' : 'Nova Sessão de Meal Prep'}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSave} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente *</Label>
              <select
                id="clienteId"
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value, mealPlanId: '' })}
                required
                className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[48px]"
              >
                <option value="">Selecione um cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealPlanId">Plano Alimentar *</Label>
              <select
                id="mealPlanId"
                value={form.mealPlanId}
                onChange={(e) => setForm({ ...form, mealPlanId: e.target.value })}
                required
                disabled={!form.clienteId}
                className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[48px] disabled:opacity-50"
              >
                <option value="">{form.clienteId ? 'Selecione um plano...' : 'Selecione um cliente primeiro'}</option>
                {planosDoCliente.map((p) => (
                  <option key={p.id} value={p.id}>{p.description}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data e Hora *</Label>
              <Input id="date" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="min-h-[48px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Local *</Label>
              <select
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[48px]"
              >
                <option value="CASA_CLIENTE">Casa do Cliente</option>
                <option value="COZINHA_CHEF">Cozinha da Chef</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="mealCount">Nº de Refeições</Label>
                <Input id="mealCount" type="number" min="1" value={form.mealCount} onChange={(e) => setForm({ ...form, mealCount: e.target.value })} className="min-h-[48px]" placeholder="ex: 20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationHours">Duração (horas)</Label>
                <Input id="durationHours" type="number" min="1" value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })} className="min-h-[48px]" placeholder="ex: 5" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="groceryService"
                checked={form.groceryService}
                onCheckedChange={() => setForm({ ...form, groceryService: !form.groceryService })}
              />
              <Label htmlFor="groceryService" className="text-sm cursor-pointer leading-tight">
                Serviço de compras (adicional)
              </Label>
            </div>
            {editingId && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[48px]"
                >
                  <option value="AGENDADO">Agendado</option>
                  <option value="EM_EXECUCAO">Em Execução</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[80px]" placeholder="Anotações sobre a sessão..." />
            </div>
            <Button type="submit" className="w-full min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white" disabled={!form.clienteId || !form.mealPlanId || !form.date}>
              {editingId ? 'Salvar Alterações' : 'Agendar Sessão'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
