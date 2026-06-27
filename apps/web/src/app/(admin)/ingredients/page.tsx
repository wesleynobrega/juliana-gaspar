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
import {
  PackageOpen,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  ShoppingCart,
  ClipboardList,
  Printer,
  CheckCircle2,
} from 'lucide-react';

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

interface PurchaseSuggestionItem {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  currentStock: number;
  requiredQty: number;
  suggestedPurchase: number;
}

interface PurchaseSuggestion {
  confirmedOrders: number;
  items: PurchaseSuggestionItem[];
}

const emptyForm: IngredientFormData = { name: '', unit: '', stockQty: 0, minStock: 0 };

function stockBadge(qty: number, min: number) {
  if (qty === 0) return { label: 'Esgotado', color: 'bg-red-100 text-red-800' };
  if (qty <= min) return { label: 'Baixo', color: 'bg-orange-100 text-orange-800' };
  return { label: 'OK', color: 'bg-green-100 text-green-800' };
}

export default function IngredientesPage() {
  // -- Estoque state
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IngredientFormData>(emptyForm);

  // -- Sugestão de Compras state
  const [tab, setTab] = useState<'estoque' | 'compras'>('estoque');
  const [suggestion, setSuggestion] = useState<PurchaseSuggestion | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

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

  // -- Sugestão de Compras
  const loadSuggestion = async () => {
    setSuggestionLoading(true);
    try {
      const data = await api.get<PurchaseSuggestion>('/ingredients/purchase-suggestion');
      setSuggestion(data);
    } catch {
      toast.error('Erro ao carregar sugestão de compras.');
    } finally {
      setSuggestionLoading(false);
    }
  };

  const switchToCompras = () => {
    setTab('compras');
    if (!suggestion) loadSuggestion();
  };

  const copyToClipboard = () => {
    if (!suggestion) return;
    const lines = [
      `Sugestão de Compras — ${suggestion.confirmedOrders} pedidos confirmados`,
      '',
      'Ingrediente | Unidade | Estoque | Necessário | Comprar',
      '-'.repeat(60),
      ...suggestion.items.map((item) => {
        const purchase = item.suggestedPurchase > 0 ? item.suggestedPurchase.toFixed(2) : 'Estoque suficiente';
        return `${item.ingredientName} | ${item.unit} | ${item.currentStock} | ${item.requiredQty} | ${purchase}`;
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(
      () => toast.success('Lista copiada para a área de transferência!'),
      () => toast.error('Erro ao copiar.'),
    );
  };

  const printSuggestion = () => {
    window.print();
  };

  // -- Print styles injected once when suggestion is shown
  const printStyles = tab === 'compras' && suggestion ? (
    <style>{`
      @media print {
        body * { visibility: hidden; }
        #purchase-suggestion-print, #purchase-suggestion-print * { visibility: visible; }
        #purchase-suggestion-print { position: absolute; left: 0; top: 0; width: 100%; }
      }
    `}</style>
  ) : null;

  // ======== Estoque tab ========
  if (tab === 'estoque') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-primary-900">Ingredientes</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={switchToCompras}
              className="min-h-[44px] border-primary-300 text-primary-700 hover:bg-primary-50"
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Sugestão de Compras
            </Button>
            <Button onClick={openCreate} className="bg-primary-700 hover:bg-primary-600 text-white min-h-[44px]">
              <Plus className="w-4 h-4 mr-2" /> Novo Ingrediente
            </Button>
          </div>
        </div>

        <Input
          placeholder="Buscar ingredientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm min-h-[48px] mb-6"
        />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-[88px] rounded-xl" />))}
          </div>
        ) : error ? (
          <>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
            <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
          </>
        ) : ingredients.length === 0 ? (
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

  // ======== Sugestão de Compras tab ========
  return (
    <div>
      {printStyles}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">Sugestão de Compras</h1>
        <Button variant="outline" onClick={() => setTab('estoque')} className="min-h-[44px] border-primary-300 text-primary-700 hover:bg-primary-50">
          <PackageOpen className="w-4 h-4 mr-2" /> Voltar para Estoque
        </Button>
      </div>

      {suggestionLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-[64px] rounded-xl" />))}
        </div>
      ) : !suggestion ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          Erro ao carregar sugestão de compras.
          <Button variant="link" onClick={loadSuggestion} className="ml-2 p-0 h-auto text-primary-700">Tentar novamente</Button>
        </div>
      ) : (
        <div id="purchase-suggestion-print">
          {/* Header card */}
          <Card className="border-primary-200 bg-primary-50/50 mb-6">
            <CardContent className="p-5 flex items-center gap-4">
              <ShoppingCart className="w-8 h-8 text-primary-600" />
              <div>
                <p className="text-sm text-primary-500">Pedidos confirmados considerados</p>
                <p className="text-2xl font-bold text-primary-900">{suggestion.confirmedOrders}</p>
              </div>
            </CardContent>
          </Card>

          {/* Export buttons */}
          <div className="flex items-center gap-3 mb-4">
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-primary-700 border-primary-300">
              <ClipboardList className="w-4 h-4 mr-2" /> Copiar Lista
            </Button>
            <Button variant="outline" size="sm" onClick={printSuggestion} className="text-primary-700 border-primary-300">
              <Printer className="w-4 h-4 mr-2" /> Imprimir
            </Button>
          </div>

          {/* Items table */}
          {suggestion.items.length === 0 ? (
            <EmptyState title="Nada a comprar" description="Estoque suficiente para todos os ingredientes." />
          ) : (
            <Card className="border-primary-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-cream-50 border-b border-primary-100">
                      <th className="text-left p-4 font-semibold text-primary-700">Ingrediente</th>
                      <th className="text-left p-4 font-semibold text-primary-700">Un.</th>
                      <th className="text-right p-4 font-semibold text-primary-700">Estoque</th>
                      <th className="text-right p-4 font-semibold text-primary-700">Necessário</th>
                      <th className="text-right p-4 font-semibold text-primary-700">Comprar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestion.items.map((item) => {
                      const needsBuying = item.suggestedPurchase > 0;
                      return (
                        <tr
                          key={item.ingredientId}
                          className={`border-b border-primary-50 last:border-0 ${
                            needsBuying ? 'bg-amber-50/60' : 'bg-green-50/40'
                          }`}
                        >
                          <td className="p-4 font-medium text-primary-900">{item.ingredientName}</td>
                          <td className="p-4 text-primary-500">{item.unit}</td>
                          <td className="p-4 text-right text-primary-700">{item.currentStock}</td>
                          <td className="p-4 text-right text-primary-700">{item.requiredQty}</td>
                          <td className="p-4 text-right">
                            {needsBuying ? (
                              <Badge className="bg-amber-100 text-amber-800 font-semibold">
                                {item.suggestedPurchase.toFixed(2)}
                              </Badge>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-green-700 text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Estoque suficiente
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
