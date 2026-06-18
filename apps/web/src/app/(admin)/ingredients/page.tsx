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
import { PackageOpen, Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stockQty: number;
  minStock: number;
}

interface IngredientFormData {
  name: string;
  unit: string;
  stockQty: number;
  minStock: number;
}

const emptyForm: IngredientFormData = { name: '', unit: '', stockQty: 0, minStock: 0 };

function stockBadge(qty: number, min: number) {
  if (qty === 0) return { label: 'Esgotado', color: 'bg-red-100 text-red-800' };
  if (qty <= min) return { label: 'Baixo', color: 'bg-orange-100 text-orange-800' };
  return { label: 'OK', color: 'bg-green-100 text-green-800' };
}

export default function IngredientesPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IngredientFormData>(emptyForm);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      const res = await api.get<{ data: Ingredient[] }>(`/ingredients?${params.toString()}`);
      setIngredients(res.data ?? []);
    } catch {
      setError('Não foi possível carregar os ingredientes.');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (i: Ingredient) => {
    setEditingId(i.id);
    setForm({ name: i.name, unit: i.unit, stockQty: i.stockQty, minStock: i.minStock });
    setSheetOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/ingredients/${editingId}`, form);
        toast.success('Ingrediente atualizado com sucesso!');
      } else {
        await api.post('/ingredients', form);
        toast.success('Ingrediente criado com sucesso!');
      }
      setSheetOpen(false);
      load();
    } catch {
      toast.error('Erro ao salvar ingrediente. Tente novamente.');
    }
  };

  const handleDelete = async (ingredient: Ingredient) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${ingredient.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/ingredients/${ingredient.id}`);
      toast.success('Ingrediente removido com sucesso!');
      load();
    } catch {
      toast.error('Erro ao remover ingrediente.');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Ingredientes</h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-[88px] rounded-xl" />))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Ingredientes</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">Ingredientes</h1>
        <Button onClick={openCreate} className="bg-primary-700 hover:bg-primary-600 text-white min-h-[44px]">
          <Plus className="w-4 h-4 mr-2" /> Novo Ingrediente
        </Button>
      </div>

      <Input
        placeholder="Buscar ingredientes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm min-h-[48px] mb-6"
      />

      {ingredients.length === 0 ? (
        <EmptyState title="Nenhum ingrediente" description="Nenhum ingrediente cadastrado ainda." />
      ) : (
        <div className="space-y-3">
          {ingredients.map((i) => {
            const stock = stockBadge(i.stockQty, i.minStock);
            return (
              <Card key={i.id} className="border-primary-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-primary-900">{i.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-primary-400">
                      <span>Unidade: {i.unit}</span>
                      <span>•</span>
                      <span>Estoque: {i.stockQty}</span>
                      <span>•</span>
                      <span>Mínimo: {i.minStock}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs ${stock.color}`}>{stock.label}</Badge>
                    {i.stockQty <= i.minStock && (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-500 hover:text-primary-700" onClick={() => openEdit(i)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(i)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">
              {editingId ? 'Editar Ingrediente' : 'Novo Ingrediente'}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSave} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} className="min-h-[48px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade (kg, L, un, etc.)</Label>
              <Input id="unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required placeholder="kg" className="min-h-[48px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockQty">Quantidade em Estoque</Label>
              <Input id="stockQty" type="number" step="0.01" min="0" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: parseFloat(e.target.value) || 0 })} required className="min-h-[48px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo</Label>
              <Input id="minStock" type="number" step="0.01" min="0" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })} required className="min-h-[48px]" />
            </div>
            <Button type="submit" className="w-full min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white">
              {editingId ? 'Salvar Alterações' : 'Criar Ingrediente'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
