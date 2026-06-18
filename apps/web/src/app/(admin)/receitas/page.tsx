'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';

interface RecipeItem {
  id: string;
  dishId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

interface Dish {
  id: string;
  name: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

export default function ReceitasPage() {
  const [items, setItems] = useState<RecipeItem[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dishFilter, setDishFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ dishId: '', ingredientId: '', quantity: '' });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (dishFilter && dishFilter !== 'all') params.set('dishId', dishFilter);
      const res = await api.get<{ data: RecipeItem[] }>(`/recipes?${params.toString()}`);
      setItems(res.data ?? []);
    } catch {
      setError('Não foi possível carregar as receitas.');
    } finally {
      setIsLoading(false);
    }
  }, [dishFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    async function loadRefs() {
      try {
        const [d, i] = await Promise.all([
          api.get<{ data: Dish[] }>('/dishes?limit=100'),
          api.get<{ data: Ingredient[] }>('/ingredients?limit=100'),
        ]);
        setDishes(d.data ?? []);
        setIngredients(i.data ?? []);
      } catch { /* ignore */ }
    }
    loadRefs();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ dishId: '', ingredientId: '', quantity: '' });
    setSheetOpen(true);
  };

  const openEdit = (item: RecipeItem) => {
    setEditingId(item.id);
    setForm({ dishId: item.dishId, ingredientId: item.ingredientId, quantity: String(item.quantity) });
    setSheetOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { dishId: form.dishId, ingredientId: form.ingredientId, quantity: parseFloat(form.quantity) };
    try {
      if (editingId) {
        await api.put(`/recipes/${editingId}`, body);
        toast.success('Item de receita atualizado!');
      } else {
        await api.post('/recipes', body);
        toast.success('Item de receita criado!');
      }
      setSheetOpen(false);
      load();
    } catch {
      toast.error('Erro ao salvar item da receita.');
    }
  };

  const handleDelete = async (item: RecipeItem) => {
    if (!window.confirm(`Tem certeza que deseja excluir este item de receita?`)) return;
    try {
      await api.delete(`/recipes/${item.id}`);
      toast.success('Item de receita removido!');
      load();
    } catch {
      toast.error('Erro ao remover item da receita.');
    }
  };

  const getDishName = (dishId: string) => dishes.find((d) => d.id === dishId)?.name ?? dishId.slice(0, 8);

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Receitas</h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-[88px] rounded-xl" />))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Receitas</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">Receitas</h1>
        <Button onClick={openCreate} className="bg-primary-700 hover:bg-primary-600 text-white min-h-[44px]">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Item
        </Button>
      </div>

      <div className="mb-6 max-w-xs">
        <Select value={dishFilter} onValueChange={(v) => v && setDishFilter(v)}>
          <SelectTrigger className="min-h-[48px]">
            <SelectValue placeholder="Filtrar por prato..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os pratos</SelectItem>
            {dishes.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Nenhum item de receita" description="Nenhum item de receita cadastrado ainda." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="border-primary-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-primary-500" />
                    <h3 className="font-semibold text-sm text-primary-900">{getDishName(item.dishId)}</h3>
                  </div>
                  <p className="text-xs text-primary-400">
                    {item.ingredientName} — {item.quantity} {item.unit}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-500 hover:text-primary-700" onClick={() => openEdit(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(item)}>
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
              {editingId ? 'Editar Item da Receita' : 'Novo Item da Receita'}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSave} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label>Prato</Label>
              <Select value={form.dishId} onValueChange={(v) => v && setForm({ ...form, dishId: v })}>
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue placeholder="Selecione um prato..." />
                </SelectTrigger>
                <SelectContent>
                  {dishes.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ingrediente</Label>
              <Select value={form.ingredientId} onValueChange={(v) => v && setForm({ ...form, ingredientId: v })}>
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue placeholder="Selecione um ingrediente..." />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name} ({i.unit})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" step="0.01" min="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required placeholder="0.25" className="min-h-[48px]" />
            </div>
            <Button type="submit" className="w-full min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white" disabled={!form.dishId || !form.ingredientId || !form.quantity}>
              {editingId ? 'Salvar Alterações' : 'Adicionar Item'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
