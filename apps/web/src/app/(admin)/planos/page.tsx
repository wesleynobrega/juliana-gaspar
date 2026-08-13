'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, ClipboardList } from 'lucide-react';
import { PLANO_ORIGEM_LABELS } from '@/lib/constants';

interface Cliente {
  id: string;
  name: string;
}

interface PlanoAlimentar {
  id: string;
  clienteId: string;
  clienteName: string | null;
  origem: string;
  description: string;
  period: string | null;
  healthProfessionalName: string | null;
  healthProfessionalSpecialty: string | null;
  notes: string | null;
}

interface PlanoFormData {
  clienteId: string;
  origem: string;
  description: string;
  period: string;
  healthProfessionalName: string;
  healthProfessionalSpecialty: string;
  notes: string;
}

const emptyForm: PlanoFormData = {
  clienteId: '',
  origem: 'EXPERIENCIA_CHEF',
  description: '',
  period: '',
  healthProfessionalName: '',
  healthProfessionalSpecialty: '',
  notes: '',
};

function planoToForm(p: PlanoAlimentar): PlanoFormData {
  return {
    clienteId: p.clienteId,
    origem: p.origem,
    description: p.description,
    period: p.period ?? '',
    healthProfessionalName: p.healthProfessionalName ?? '',
    healthProfessionalSpecialty: p.healthProfessionalSpecialty ?? '',
    notes: p.notes ?? '',
  };
}

export default function PlanosPage() {
  const [planos, setPlanos] = useState<PlanoAlimentar[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanoFormData>(emptyForm);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [planosRes, clientesRes] = await Promise.all([
        api.get<{ data: PlanoAlimentar[] }>('/meal-plans?limit=100'),
        api.get<{ data: Cliente[] }>('/clients?limit=100'),
      ]);
      setPlanos(planosRes.data ?? []);
      setClientes(clientesRes.data ?? []);
    } catch {
      setError('Não foi possível carregar os planos alimentares.');
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

  const openEdit = (p: PlanoAlimentar) => {
    setEditingId(p.id);
    setForm(planoToForm(p));
    setSheetOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      clienteId: form.clienteId,
      origem: form.origem,
      description: form.description,
      period: form.period || null,
      healthProfessionalName: form.healthProfessionalName || null,
      healthProfessionalSpecialty: form.healthProfessionalSpecialty || null,
      notes: form.notes || null,
    };
    try {
      if (editingId) {
        await api.put(`/meal-plans/${editingId}`, payload);
        toast.success('Plano alimentar atualizado com sucesso!');
      } else {
        await api.post('/meal-plans', payload);
        toast.success('Plano alimentar criado com sucesso!');
      }
      setSheetOpen(false);
      load();
    } catch {
      toast.error('Erro ao salvar plano alimentar. Tente novamente.');
    }
  };

  const handleDelete = async (p: PlanoAlimentar) => {
    if (!window.confirm(`Tem certeza que deseja excluir o plano de "${p.clienteName ?? 'cliente'}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/meal-plans/${p.id}`);
      toast.success('Plano alimentar removido com sucesso!');
      load();
    } catch {
      toast.error('Erro ao remover plano alimentar.');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Planos Alimentares</h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-[88px] rounded-xl" />))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Planos Alimentares</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">Planos Alimentares</h1>
        <Button onClick={openCreate} className="bg-primary-700 hover:bg-primary-600 text-white min-h-[44px]">
          <Plus className="w-4 h-4 mr-2" /> Novo Plano
        </Button>
      </div>

      {planos.length === 0 ? (
        <EmptyState title="Nenhum plano alimentar" description="Crie um plano alimentar para um cliente." />
      ) : (
        <div className="space-y-3">
          {planos.map((p) => (
            <Card key={p.id} className="border-primary-100">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-primary-900">{p.clienteName ?? 'Cliente'}</h3>
                    <Badge className="text-xs bg-primary-50 text-primary-700">
                      {PLANO_ORIGEM_LABELS[p.origem] ?? p.origem}
                    </Badge>
                  </div>
                  <p className="text-sm text-primary-600 line-clamp-2">{p.description}</p>
                  <div className="flex items-center gap-2 text-xs text-primary-400 flex-wrap">
                    {p.period && <span>Período: {p.period}</span>}
                    {p.healthProfessionalName && (
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3 h-3" />
                        {p.healthProfessionalName}
                        {p.healthProfessionalSpecialty ? ` — ${p.healthProfessionalSpecialty}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-500 hover:text-primary-700" onClick={() => openEdit(p)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(p)}>
                    <Trash2 className="w-4 h-4" />
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
            <SheetTitle className="font-display text-lg text-primary-900">
              {editingId ? 'Editar Plano Alimentar' : 'Novo Plano Alimentar'}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSave} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente *</Label>
              <select
                id="clienteId"
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
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
              <Label htmlFor="origem">Origem do Plano</Label>
              <select
                id="origem"
                value={form.origem}
                onChange={(e) => setForm({ ...form, origem: e.target.value })}
                className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[48px]"
              >
                <option value="EXPERIENCIA_CHEF">Experiência da Chef</option>
                <option value="PROFISSIONAL_SAUDE">Profissional de Saúde</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="min-h-[80px]" placeholder="Descrição do plano alimentar..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Input id="period" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="min-h-[48px]" placeholder="ex: 4 semanas" />
            </div>
            <div className="space-y-3 pt-2 border-t border-primary-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Profissional de Saúde (opcional)</h4>
              <div className="space-y-2">
                <Label htmlFor="healthProfessionalName">Nome</Label>
                <Input id="healthProfessionalName" value={form.healthProfessionalName} onChange={(e) => setForm({ ...form, healthProfessionalName: e.target.value })} className="min-h-[48px]" placeholder="ex: Dra. Maria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="healthProfessionalSpecialty">Especialidade</Label>
                <Input id="healthProfessionalSpecialty" value={form.healthProfessionalSpecialty} onChange={(e) => setForm({ ...form, healthProfessionalSpecialty: e.target.value })} className="min-h-[48px]" placeholder="ex: Nutricionista" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[80px]" placeholder="Anotações sobre o plano..." />
            </div>
            <Button type="submit" className="w-full min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white" disabled={!form.clienteId || !form.description.trim()}>
              {editingId ? 'Salvar Alterações' : 'Criar Plano'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
