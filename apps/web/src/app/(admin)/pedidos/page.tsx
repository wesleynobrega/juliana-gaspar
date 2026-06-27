'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiltrosPedidos } from '@/features/admin/pedidos/components/filtros-pedidos';
import { PedidosLista } from '@/features/admin/pedidos/components/pedidos-lista';
import { PedidoDetalhesSheet } from '@/features/admin/pedidos/components/pedido-detalhes-sheet';
import { usePedidos } from '@/features/admin/pedidos/hooks/use-pedidos';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Copy,
  RotateCcw,
  Beef,
  Wheat,
  Leaf,
  Droplets,
  ShoppingCart,
  History,
  Star,
  X,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────

type NutrientType = 'PROTEINA' | 'CARBOIDRATO' | 'FIBRA' | 'GORDURA';

interface MenuItem {
  id: string;
  name: string;
  nutrientType: NutrientType;
  description: string | null;
  baseUnit: string;
}

interface CustomerOption {
  id: string;
  name: string;
  phone: string | null;
  tags: string[];
}

interface FavoriteMeal {
  id: string;
  customerId: string;
  label: string;
  proteinId: string;
  carboId: string;
  fiberId: string;
  fatId: string | null;
  createdAt: string;
}

interface PreviousOrder {
  orderId: string;
  createdAt: string;
  mealCount: number;
  meals: Array<{
    id: string;
    notes: string | null;
    components: Array<{
      menuItemId: string;
      menuItemName: string;
      nutrientType: string;
      quantity: number;
      unitPrice: number;
    }>;
  }>;
}

interface MealSlot {
  proteinId: string;
  carboId: string;
  fiberId: string;
  fatId: string;
  copyFromSlot?: number;
}

const NUTRIENT_LABELS: Record<NutrientType, string> = {
  PROTEINA: 'Proteína',
  CARBOIDRATO: 'Carboidrato',
  FIBRA: 'Fibra',
  GORDURA: 'Gordura',
};

const NUTRIENT_ICONS: Record<NutrientType, React.ReactNode> = {
  PROTEINA: <Beef className="w-4 h-4" />,
  CARBOIDRATO: <Wheat className="w-4 h-4" />,
  FIBRA: <Leaf className="w-4 h-4" />,
  GORDURA: <Droplets className="w-4 h-4" />,
};

const NUTRIENT_COLORS: Record<NutrientType, string> = {
  PROTEINA: 'border-red-300 bg-red-50',
  CARBOIDRATO: 'border-amber-300 bg-amber-50',
  FIBRA: 'border-green-300 bg-green-50',
  GORDURA: 'border-yellow-300 bg-yellow-50',
};

// ── Page ───────────────────────────────────────────────

export default function PedidosPage() {
  const { pedidos, isLoading, filters, setFilters, refresh } = usePedidos();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Novo pedido sheet
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold text-primary-900">Pedidos</h1>
        <Button onClick={() => setSheetOpen(true)} className="min-h-[48px]">
          <Plus className="w-4 h-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <FiltrosPedidos filters={filters} onChange={setFilters} />

      <div className="flex-1 overflow-y-auto">
        <PedidosLista pedidos={pedidos} isLoading={isLoading} onSelectPedido={(id) => setSelectedId(id)} />
      </div>

      <PedidoDetalhesSheet pedidoId={selectedId} onClose={() => setSelectedId(null)} />

      <NovoPedidoSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={() => {
          setSheetOpen(false);
          // re-fetch by toggling filters
          refresh();
        }}
      />
    </div>
  );
}

// ── NovoPedidoSheet ────────────────────────────────────

function NovoPedidoSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  // Step tracking
  const [step, setStep] = useState(1);

  // Customer
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [searching, setSearching] = useState(false);

  // Meal count
  const [mealCount, setMealCount] = useState<7 | 14>(7);

  // Menu items cache
  const [menuItems, setMenuItems] = useState<Record<NutrientType, MenuItem[]>>({
    PROTEINA: [],
    CARBOIDRATO: [],
    FIBRA: [],
    GORDURA: [],
  });
  const [menuLoading, setMenuLoading] = useState(false);

  // Meal slots
  const [meals, setMeals] = useState<MealSlot[]>([]);

  // Favorites & previous orders
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [previousOrders, setPreviousOrders] = useState<PreviousOrder[]>([]);
  const [favsLoading, setFavsLoading] = useState(false);

  // Delivery
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Submit
  const [submitting, setSubmitting] = useState(false);

  // Active tab: build | favorites | previous
  const [activeTab, setActiveTab] = useState('build');

  // ── Initialize meal slots ──────────────────────────
  const initMeals = useCallback((count: 7 | 14) => {
    setMeals(Array.from({ length: count }, (_, i) => ({
      proteinId: '',
      carboId: '',
      fiberId: '',
      fatId: '',
    })));
  }, []);

  useEffect(() => {
    initMeals(mealCount);
  }, [mealCount, initMeals]);

  // ── Load menu on sheet open ────────────────────────
  const loadMenu = useCallback(async () => {
    setMenuLoading(true);
    try {
      const types: NutrientType[] = ['PROTEINA', 'CARBOIDRATO', 'FIBRA', 'GORDURA'];
      const results = await Promise.all(
        types.map((t) => api.get<{ data: MenuItem[] }>(`/menu?nutrientType=${t}&limit=100`)),
      );
      const map: Record<NutrientType, MenuItem[]> = {
        PROTEINA: [],
        CARBOIDRATO: [],
        FIBRA: [],
        GORDURA: [],
      };
      types.forEach((t, i) => {
        map[t] = results[i].data ?? [];
      });
      setMenuItems(map);
    } catch {
      toast.error('Erro ao carregar cardápio');
    } finally {
      setMenuLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadMenu();
      resetForm();
    }
  }, [open, loadMenu]);

  // ── Customer search ─────────────────────────────────
  useEffect(() => {
    if (!customerSearch.trim() || customerSearch.length < 2) {
      setCustomers([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get<{ data: CustomerOption[] }>(
          `/customers?search=${encodeURIComponent(customerSearch)}&limit=10`,
        );
        setCustomers(res.data ?? []);
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  // ── Load favorites & previous when customer selected
  useEffect(() => {
    if (!selectedCustomer) {
      setFavorites([]);
      setPreviousOrders([]);
      return;
    }
    setFavsLoading(true);
    Promise.all([
      api.get<{ data: FavoriteMeal[] }>(`/customers/${selectedCustomer.id}/favorites`).then((r) => r.data ?? []).catch(() => [] as FavoriteMeal[]),
      api.get<{ data: PreviousOrder[] }>(`/orders/previous-meals/${selectedCustomer.id}`).then((r) => r.data ?? []).catch(() => [] as PreviousOrder[]),
    ])
      .then(([favs, prev]) => {
        setFavorites(favs);
        setPreviousOrders(prev);
      })
      .finally(() => setFavsLoading(false));
  }, [selectedCustomer]);

  // ── Menu lookup helpers ─────────────────────────────
  const menuById = useMemo(() => {
    const map = new Map<string, MenuItem>();
    for (const items of Object.values(menuItems)) {
      for (const item of items) {
        map.set(item.id, item);
      }
    }
    return map;
  }, [menuItems]);

  const getItemName = (id: string) => menuById.get(id)?.name ?? id.slice(0, 8);

  // ── Slot update ─────────────────────────────────────
  const updateSlot = (index: number, field: keyof MealSlot, value: string) => {
    setMeals((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const copyFromSlot = (targetIndex: number, sourceSlot: number) => {
    const source = meals[sourceSlot - 1];
    if (!source) return;
    setMeals((prev) =>
      prev.map((m, i) =>
        i === targetIndex
          ? { ...source, copyFromSlot: undefined }
          : m,
      ),
    );
    toast.success(`Refeição ${targetIndex + 1} copiada do slot ${sourceSlot}`);
  };

  const repeatPrevious = (index: number) => {
    if (index === 0) {
      toast.error('Não há refeição anterior para copiar');
      return;
    }
    const source = meals[index - 1];
    setMeals((prev) =>
      prev.map((m, i) =>
        i === index ? { ...source, copyFromSlot: undefined } : m,
      ),
    );
    toast.success(`Refeição ${index + 1} repete a anterior`);
  };

  const applyFavorite = (fav: FavoriteMeal, targetIndex: number) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === targetIndex
          ? { proteinId: fav.proteinId, carboId: fav.carboId, fiberId: fav.fiberId, fatId: fav.fatId ?? '', copyFromSlot: undefined }
          : m,
      ),
    );
    toast.success(`\"${fav.label}\" aplicada ao slot ${targetIndex + 1}`);
    setActiveTab('build');
  };

  const applyPreviousMeal = (meal: PreviousOrder['meals'][number], targetIndex: number) => {
    const protein = meal.components.find((c) => c.nutrientType === 'PROTEINA');
    const carbo = meal.components.find((c) => c.nutrientType === 'CARBOIDRATO');
    const fiber = meal.components.find((c) => c.nutrientType === 'FIBRA');
    const fat = meal.components.find((c) => c.nutrientType === 'GORDURA');
    setMeals((prev) =>
      prev.map((m, i) =>
        i === targetIndex
          ? {
              proteinId: protein?.menuItemId ?? '',
              carboId: carbo?.menuItemId ?? '',
              fiberId: fiber?.menuItemId ?? '',
              fatId: fat?.menuItemId ?? '',
              copyFromSlot: undefined,
            }
          : m,
      ),
    );
    toast.success(`Refeição copiada para slot ${targetIndex + 1}`);
    setActiveTab('build');
  };

  // ── Validation ──────────────────────────────────────
  const canSubmit = useMemo(() => {
    if (!selectedCustomer) return false;
    if (!deliveryAddress || deliveryAddress.trim().length < 10) return false;
    return meals.every((m) => m.proteinId && m.carboId && m.fiberId);
  }, [selectedCustomer, deliveryAddress, meals]);

  // ── Submit ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit || !selectedCustomer) return;

    setSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomer.id,
        planType: 'SINGLE',
        mealType: 'ALMOCO_JANTA',
        deliveryAddress: deliveryAddress.trim(),
        deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
        mealCount,
        meals: meals.map((m, i) => {
          const base: Record<string, unknown> = {
            slot: i + 1,
            proteinId: m.proteinId,
            carboId: m.carboId,
            fiberId: m.fiberId,
          };
          if (m.fatId) base.fatId = m.fatId;
          return base;
        }),
      };

      await api.post('/orders/meal-based', payload);
      toast.success('Pedido criado com sucesso!');
      onCreated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar pedido';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset ───────────────────────────────────────────
  const resetForm = () => {
    setStep(1);
    setCustomerSearch('');
    setCustomers([]);
    setSelectedCustomer(null);
    setMealCount(7);
    initMeals(7);
    setFavorites([]);
    setPreviousOrders([]);
    setDeliveryAddress('');
    setDeliveryDate('');
    setNotes('');
    setActiveTab('build');
  };

  // ── Build meal section ──────────────────────────────
  const SelectPicker = ({
    label,
    icon,
    colorClass,
    value,
    onChange,
    options,
    loading,
    optional = false,
  }: {
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    value: string;
    onChange: (v: string) => void;
    options: MenuItem[];
    loading: boolean;
    optional?: boolean;
  }) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-xs text-primary-600">{label}{optional ? ' (opcional)' : ' *'}</span>
      </div>
      {loading ? (
        <div className={cn('border rounded-lg px-3 py-2 text-sm text-primary-400 min-h-[42px]', colorClass)}>
          Carregando...
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full border rounded-lg px-3 py-2 text-sm min-h-[42px] focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white',
            colorClass,
          )}
        >
          <option value="">{optional ? 'Nenhum' : 'Selecionar...'}</option>
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} {item.baseUnit ? `(${item.baseUnit})` : ''}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-cream">
        <SheetHeader>
          <SheetTitle className="font-display text-lg text-primary-900">
            {step === 1 && 'Novo Pedido — Cliente'}
            {step === 2 && 'Novo Pedido — Refeições'}
            {step === 3 && 'Novo Pedido — Entrega'}
          </SheetTitle>
          <SheetDescription className="text-primary-500">
            {step === 1 && 'Selecione o cliente e a quantidade de refeições.'}
            {step === 2 && 'Monte cada refeição com proteína, carboidrato, fibra e gordura.'}
            {step === 3 && 'Endereço de entrega e data.'}
          </SheetDescription>
        </SheetHeader>

        {/* ── Progress ────────────────────────────── */}
        <div className="flex gap-2 mt-4 mb-6">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={cn(
                'flex-1 h-2 rounded-full transition-colors',
                s <= step ? 'bg-primary-700' : 'bg-primary-200',
              )}
            />
          ))}
        </div>

        {/* ── Step 1: Customer ────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Search */}
            <div>
              <Label className="text-sm text-primary-700 mb-1 block">
                Buscar cliente
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                <Input
                  placeholder="Nome ou telefone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-10 min-h-[48px]"
                />
              </div>
              {searching && (
                <p className="text-xs text-primary-400 mt-1">Buscando...</p>
              )}
              {customers.length > 0 && !selectedCustomer && (
                <div className="mt-2 border border-primary-200 rounded-lg bg-white divide-y divide-primary-100 max-h-48 overflow-y-auto">
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerSearch('');
                        setCustomers([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors"
                    >
                      <span className="font-medium text-primary-900">{c.name}</span>
                      {c.phone && (
                        <span className="text-xs text-primary-500 ml-2">{c.phone}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="flex items-center gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <span className="font-medium text-primary-900">{selectedCustomer.name}</span>
                {selectedCustomer.phone && (
                  <span className="text-xs text-primary-500">{selectedCustomer.phone}</span>
                )}
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="ml-auto text-primary-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Meal count */}
            <div>
              <Label className="text-sm text-primary-700 mb-2 block">
                Quantas refeições?
              </Label>
              <div className="flex gap-3">
                {([7, 14] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setMealCount(n)}
                    className={cn(
                      'flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-colors min-h-[56px]',
                      mealCount === n
                        ? 'border-primary-700 bg-primary-700 text-white'
                        : 'border-primary-200 bg-white text-primary-700 hover:border-primary-400',
                    )}
                  >
                    {n} refeições
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedCustomer}
                className="min-h-[48px]"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Build meals ─────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-primary-100/50 mb-4">
                <TabsTrigger value="build" className="flex-1">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Montar
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex-1" disabled={!selectedCustomer}>
                  <Star className="w-4 h-4 mr-1" />
                  Favoritos
                </TabsTrigger>
                <TabsTrigger value="previous" className="flex-1" disabled={!selectedCustomer}>
                  <History className="w-4 h-4 mr-1" />
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="build" className="space-y-4 mt-0">
                {menuLoading ? (
                  <p className="text-primary-500 text-sm py-8 text-center">Carregando cardápio...</p>
                ) : (
                  meals.map((meal, idx) => (
                    <Card key={idx} className="border-primary-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary-700 text-white min-w-[28px] justify-center">
                              {idx + 1}
                            </Badge>
                            <span className="text-sm font-medium text-primary-900">
                              Refeição {idx + 1}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-primary-500"
                              onClick={() => repeatPrevious(idx)}
                              disabled={idx === 0}
                              title="Repetir refeição anterior"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Anterior
                            </Button>
                            <div className="flex items-center gap-1">
                              <select
                                className="border border-primary-200 rounded text-xs px-2 py-1 min-h-[32px] bg-white"
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    copyFromSlot(idx, parseInt(e.target.value));
                                    e.target.value = '';
                                  }
                                }}
                              >
                                <option value="">Copiar...</option>
                                {meals.map((_, si) =>
                                  si !== idx ? (
                                    <option key={si} value={si + 1}>
                                      Slot {si + 1}
                                    </option>
                                  ) : null,
                                )}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <SelectPicker
                            label="Proteína"
                            icon={NUTRIENT_ICONS.PROTEINA}
                            colorClass={NUTRIENT_COLORS.PROTEINA}
                            value={meal.proteinId}
                            onChange={(v) => updateSlot(idx, 'proteinId', v)}
                            options={menuItems.PROTEINA}
                            loading={menuLoading}
                          />
                          <SelectPicker
                            label="Carboidrato"
                            icon={NUTRIENT_ICONS.CARBOIDRATO}
                            colorClass={NUTRIENT_COLORS.CARBOIDRATO}
                            value={meal.carboId}
                            onChange={(v) => updateSlot(idx, 'carboId', v)}
                            options={menuItems.CARBOIDRATO}
                            loading={menuLoading}
                          />
                          <SelectPicker
                            label="Fibra"
                            icon={NUTRIENT_ICONS.FIBRA}
                            colorClass={NUTRIENT_COLORS.FIBRA}
                            value={meal.fiberId}
                            onChange={(v) => updateSlot(idx, 'fiberId', v)}
                            options={menuItems.FIBRA}
                            loading={menuLoading}
                          />
                          <SelectPicker
                            label="Gordura"
                            icon={NUTRIENT_ICONS.GORDURA}
                            colorClass={NUTRIENT_COLORS.GORDURA}
                            value={meal.fatId}
                            onChange={(v) => updateSlot(idx, 'fatId', v)}
                            options={menuItems.GORDURA}
                            loading={menuLoading}
                            optional
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="favorites" className="mt-0">
                {favsLoading ? (
                  <p className="text-primary-500 text-sm py-8 text-center">Carregando favoritos...</p>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-8 text-primary-400">
                    <Star className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhum favorito salvo para este cliente.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favorites.map((fav) => (
                      <Card key={fav.id} className="border-primary-200">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm text-primary-900">{fav.label}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge className="text-xs bg-red-50 text-red-700 border-red-200">
                                  <Beef className="w-3 h-3 mr-0.5" />
                                  {getItemName(fav.proteinId)}
                                </Badge>
                                <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                  <Wheat className="w-3 h-3 mr-0.5" />
                                  {getItemName(fav.carboId)}
                                </Badge>
                                <Badge className="text-xs bg-green-50 text-green-700 border-green-200">
                                  <Leaf className="w-3 h-3 mr-0.5" />
                                  {getItemName(fav.fiberId)}
                                </Badge>
                                {fav.fatId && (
                                  <Badge className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                    <Droplets className="w-3 h-3 mr-0.5" />
                                    {getItemName(fav.fatId)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <select
                                className="border border-primary-200 rounded text-xs px-2 py-1 min-h-[32px] bg-white"
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    applyFavorite(fav, parseInt(e.target.value) - 1);
                                    e.target.value = '';
                                  }
                                }}
                              >
                                <option value="">Aplicar ao slot...</option>
                                {meals.map((_, si) => (
                                  <option key={si} value={si + 1}>
                                    Slot {si + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="previous" className="mt-0">
                {favsLoading ? (
                  <p className="text-primary-500 text-sm py-8 text-center">Carregando histórico...</p>
                ) : previousOrders.length === 0 ? (
                  <div className="text-center py-8 text-primary-400">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhum pedido anterior com refeições.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previousOrders.map((order) => (
                      <Card key={order.orderId} className="border-primary-200">
                        <CardContent className="p-3">
                          <p className="text-xs text-primary-500 mb-2">
                            Pedido de {new Date(order.createdAt).toLocaleDateString('pt-BR')} — {order.mealCount} refeições
                          </p>
                          {order.meals.map((meal, mi) => (
                            <div key={meal.id} className="border-t border-primary-100 py-2 first:border-t-0 first:pt-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Badge className="bg-primary-100 text-primary-700 text-xs">
                                    #{mi + 1}
                                  </Badge>
                                  <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                                    {meal.components.map((c) => (
                                      <span
                                        key={c.menuItemId}
                                        className="text-xs text-primary-600 truncate max-w-[120px]"
                                        title={c.menuItemName}
                                      >
                                        {c.menuItemName}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <Copy
                                    className="w-3.5 h-3.5 text-primary-400 cursor-pointer hover:text-primary-700"
                                    onClick={() => {
                                      const target = meals.findIndex(
                                        (m) => !m.proteinId || !m.carboId || !m.fiberId,
                                      );
                                      const idx = target >= 0 ? target : 0;
                                      applyPreviousMeal(meal, idx);
                                    }}
                                  />
                                  <select
                                    className="border border-primary-200 rounded text-xs px-1 py-0.5 min-h-[28px] bg-white"
                                    defaultValue=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        applyPreviousMeal(meal, parseInt(e.target.value) - 1);
                                        e.target.value = '';
                                      }
                                    }}
                                  >
                                    <option value="">Slot...</option>
                                    {meals.map((_, si) => (
                                      <option key={si} value={si + 1}>
                                        {si + 1}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Quick fill */}
            {favorites.length > 0 && activeTab === 'build' && (
              <div className="space-y-2">
                <p className="text-xs text-primary-500">Preencher todos os slots com favorito:</p>
                <div className="flex flex-wrap gap-2">
                  {favorites.map((fav) => (
                    <Button
                      key={fav.id}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => {
                        setMeals((prev) =>
                          prev.map(() => ({
                            proteinId: fav.proteinId,
                            carboId: fav.carboId,
                            fiberId: fav.fiberId,
                            fatId: fav.fatId ?? '',
                          })),
                        );
                        toast.success(`Todos os slots preenchidos com "${fav.label}"`);
                      }}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {fav.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="min-h-[48px]">
                Voltar
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!meals.every((m) => m.proteinId && m.carboId && m.fiberId)}
                className="min-h-[48px]"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Delivery ─────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <Label className="text-sm text-primary-700 mb-1 block">
                Endereço de entrega *
              </Label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
                placeholder="Rua, número, bairro, complemento..."
                className="w-full border border-primary-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
              />
              {deliveryAddress && deliveryAddress.trim().length < 10 && (
                <p className="text-xs text-red-500 mt-1">Endereço muito curto (mínimo 10 caracteres)</p>
              )}
            </div>

            <div>
              <Label className="text-sm text-primary-700 mb-1 block">
                Data de entrega
              </Label>
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="min-h-[48px]"
              />
            </div>

            <div>
              <Label className="text-sm text-primary-700 mb-1 block">
                Observações
              </Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Alguma observação para este pedido..."
                className="w-full border border-primary-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Summary */}
            <Card className="border-primary-200 bg-primary-50/50">
              <CardContent className="p-4 space-y-2">
                <p className="font-display text-sm font-semibold text-primary-900">Resumo do pedido</p>
                <div className="text-sm text-primary-700 space-y-1">
                  <p><strong>Cliente:</strong> {selectedCustomer?.name}</p>
                  <p><strong>Refeições:</strong> {mealCount}</p>
                  <p>
                    <strong>Proteínas:</strong>{' '}
                    {meals.filter((m) => m.proteinId).length} selecionadas
                  </p>
                  <p>
                    <strong>Carboidratos:</strong>{' '}
                    {meals.filter((m) => m.carboId).length} selecionados
                  </p>
                  <p>
                    <strong>Fibras:</strong>{' '}
                    {meals.filter((m) => m.fiberId).length} selecionadas
                  </p>
                  <p>
                    <strong>Gorduras:</strong>{' '}
                    {meals.filter((m) => m.fatId).length} selecionadas
                  </p>
                  {deliveryDate && (
                    <p>
                      <strong>Entrega:</strong>{' '}
                      {new Date(deliveryDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="min-h-[48px]">
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white"
              >
                {submitting ? (
                  <>Criando...</>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Criar Pedido
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
