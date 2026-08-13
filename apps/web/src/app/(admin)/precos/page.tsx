'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PricingConfig {
  id: string;
  key: string;
  value: number;
  description: string | null;
  active: boolean;
  updatedAt: string;
}

const KEY_LABELS: Record<string, string> = {
  mealprep_casa_cliente: 'Meal Prep — Casa do Cliente',
  mealprep_cozinha_chef: 'Meal Prep — Cozinha da Chef',
  taxa_compras: 'Taxa de Compras',
};

interface PrecoFormData {
  value: string;
  description: string;
  active: boolean;
}

export default function PrecosPage() {
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PricingConfig | null>(null);
  const [form, setForm] = useState<PrecoFormData>({ value: '', description: '', active: true });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<PricingConfig[]>('/pricing-config');
      setConfigs(res ?? []);
    } catch {
      setError('Não foi possível carregar a configuração de preços.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (c: PricingConfig) => {
    setEditing(c);
    setForm({
      value: String(c.value),
      description: c.description ?? '',
      active: c.active,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const value = parseFloat(form.value);
    if (Number.isNaN(value) || value < 0) {
      toast.error('Informe um valor válido.');
      return;
    }
    try {
      await api.put(`/pricing-config/${editing.key}`, {
        value,
        description: form.description || null,
        active: form.active,
      });
      toast.success('Preço atualizado com sucesso!');
      setEditing(null);
      load();
    } catch {
      toast.error('Erro ao atualizar preço. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Preços</h1>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-[88px] rounded-xl" />))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Preços</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900 mb-2">Preços</h1>
      <p className="text-sm text-primary-400 mb-6">Configuração central dos valores de meal prep. Usados no cálculo automático das sessões.</p>

      {configs.length === 0 ? (
        <EmptyState title="Nenhuma configuração" description="Nenhum preço cadastrado." />
      ) : (
        <div className="space-y-3">
          {configs.map((c) => (
            <Card key={c.id} className="border-primary-100">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-primary-900">
                      {KEY_LABELS[c.key] ?? c.key}
                    </h3>
                    {!c.active && <Badge className="text-xs bg-gray-100 text-gray-600">Inativo</Badge>}
                  </div>
                  {c.description && <p className="text-xs text-primary-400">{c.description}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-lg font-semibold text-primary-700">{formatCurrency(c.value)}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-primary-500 hover:text-primary-700" onClick={() => openEdit(c)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">
              {editing ? KEY_LABELS[editing.key] ?? editing.key : 'Editar Preço'}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSave} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input id="value" type="number" step="0.01" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className="min-h-[48px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[48px]" placeholder="Descrição do preço..." />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-primary-300"
              />
              <Label htmlFor="active" className="text-sm cursor-pointer">Ativo</Label>
            </div>
            <Button type="submit" className="w-full min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white">
              Salvar Alterações
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
