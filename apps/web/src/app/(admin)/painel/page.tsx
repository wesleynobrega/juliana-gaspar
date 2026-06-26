'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import {
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Package,
  Clock,
  Truck,
  MapPin,
  CreditCard,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────

interface WeeklyOrders {
  label: string;
  weekStart: string;
  weekEnd: string;
  orders: OrderDTO[];
}

interface OrderDTO {
  id: string;
  customerId: string;
  customerName: string;
  cycleId?: string;
  planType: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryAddress: string;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  items: OrderItemDTO[];
}

interface OrderItemDTO {
  id: string;
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
}

interface DashboardSummary {
  activeOrders: number;
  pendingPayments: number;
  totalCustomers: number;
  weeklyRevenue: number;
  upcomingCycles: number;
  capacityUtilization: number;
}

// ── Helpers ───────────────────────────────────────────

function getWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatWeekLabel(start: Date, end: Date): string {
  const format = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  return `${format(start)} – ${format(end)}`;
}

function getWeeklySections(orders: OrderDTO[]): WeeklyOrders[] {
  const now = new Date();

  const thisWeek = getWeekRange(now);
  const lastWeekStart = new Date(thisWeek.start);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeek.start);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  lastWeekEnd.setHours(23, 59, 59, 999);

  const nextWeekStart = new Date(thisWeek.end);
  nextWeekStart.setDate(nextWeekStart.getDate() + 1);
  nextWeekStart.setHours(0, 0, 0, 0);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
  nextWeekEnd.setHours(23, 59, 59, 999);

  const lastWeek: OrderDTO[] = [];
  const thisWeekOrders: OrderDTO[] = [];
  const nextWeekOrders: OrderDTO[] = [];

  for (const order of orders) {
    const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate) : new Date(order.createdAt);
    if (deliveryDate >= lastWeekStart && deliveryDate <= lastWeekEnd) {
      lastWeek.push(order);
    } else if (deliveryDate >= thisWeek.start && deliveryDate <= thisWeek.end) {
      thisWeekOrders.push(order);
    } else if (deliveryDate >= nextWeekStart && deliveryDate <= nextWeekEnd) {
      nextWeekOrders.push(order);
    }
  }

  return [
    { label: 'Pedidos da Semana Passada', weekStart: lastWeekStart.toISOString(), weekEnd: lastWeekEnd.toISOString(), orders: lastWeek },
    { label: 'Pedidos da Semana', weekStart: thisWeek.start.toISOString(), weekEnd: thisWeek.end.toISOString(), orders: thisWeekOrders },
    { label: 'Pedidos da Semana que Vem', weekStart: nextWeekStart.toISOString(), weekEnd: nextWeekEnd.toISOString(), orders: nextWeekOrders },
  ];
}

// ── Page ───────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sections, setSections] = useState<WeeklyOrders[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Pedidos da Semana']));

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, allOrdersRes] = await Promise.all([
          api.get<DashboardSummary>('/dashboard/summary'),
          api.get<{ data: OrderDTO[] }>('/orders?limit=200'),
        ]);

        setSummary(summaryRes);
        const orders = allOrdersRes.data ?? [];
        setSections(getWeeklySections(orders));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const kpis = [
    {
      label: 'Pedidos Ativos',
      value: summary?.activeOrders ?? 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Receita semanal',
      value: formatCurrency(summary?.weeklyRevenue ?? 0),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Clientes',
      value: summary?.totalCustomers ?? 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Ocupação',
      value: `${summary?.capacityUtilization ?? 0}%`,
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">
        Dashboard
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <Card key={i} className="border-primary-100">
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-28" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-primary-500">{kpi.label}</span>
                    <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                      <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-primary-900">{kpi.value}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly sections */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.label} className="border-primary-100">
              <CardHeader
                className="cursor-pointer hover:bg-primary-50/50 transition-colors rounded-t-xl"
                onClick={() => toggleSection(section.label)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {expandedSections.has(section.label) ? (
                      <ChevronDown className="w-5 h-5 text-primary-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-primary-500" />
                    )}
                    <CardTitle className="font-display text-lg text-primary-900">
                      {section.label}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {section.orders.length} pedido{section.orders.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <span className="text-xs text-primary-400">
                    {formatWeekLabel(new Date(section.weekStart), new Date(section.weekEnd))}
                  </span>
                </div>
              </CardHeader>

              {expandedSections.has(section.label) && (
                <CardContent>
                  {section.orders.length === 0 ? (
                    <p className="text-center text-primary-400 py-6 text-sm">
                      Nenhum pedido neste período.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {section.orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors border border-primary-50"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-primary-900 text-sm truncate">
                              {order.customerName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-primary-400 mt-0.5">
                              <span>#{order.id.slice(0, 8)}</span>
                              {order.deliveryDate && (
                                <>
                                  <span>·</span>
                                  <Truck className="w-3 h-3" />
                                  <span>{formatDate(order.deliveryDate)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                              {ORDER_STATUS_LABELS[order.status] || order.status}
                            </span>
                            <span className="font-semibold text-primary-900 text-sm">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-cream overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-xl text-primary-900">
                  Pedido de {selectedOrder.customerName}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Status row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-primary-100">
                    <span className="text-xs text-primary-400">Status</span>
                    <p>
                      <Badge className={`mt-1 text-xs ${ORDER_STATUS_COLORS[selectedOrder.status] || ''}`}>
                        {ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                      </Badge>
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-primary-100">
                    <span className="text-xs text-primary-400">Pagamento</span>
                    <p className="text-sm font-medium mt-1">
                      {PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Summary info */}
                <div className="bg-white rounded-lg border border-primary-100 divide-y divide-primary-50">
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-sm text-primary-500 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Total
                    </span>
                    <span className="font-bold text-primary-900">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  {selectedOrder.deliveryDate && (
                    <div className="flex justify-between items-center px-4 py-2.5">
                      <span className="text-sm text-primary-500 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Entrega
                      </span>
                      <span className="text-sm">{formatDate(selectedOrder.deliveryDate)}</span>
                    </div>
                  )}
                  {selectedOrder.deliveryAddress && (
                    <div className="flex justify-between items-center px-4 py-2.5">
                      <span className="text-sm text-primary-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Endereço
                      </span>
                      <span className="text-sm text-right max-w-[220px]">{selectedOrder.deliveryAddress}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-sm text-primary-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Criado em
                    </span>
                    <span className="text-sm">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="flex justify-between items-center px-4 py-2.5">
                      <span className="text-sm text-primary-500">Observações</span>
                      <span className="text-sm text-right max-w-[220px]">{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold text-sm text-primary-900 mb-2 flex items-center gap-1.5">
                    <Package className="w-4 h-4" /> Itens do pedido
                  </h4>
                  <div className="bg-white rounded-lg border border-primary-100 divide-y divide-primary-50">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-primary-900">{item.dishName}</p>
                          <p className="text-xs text-primary-400">
                            {item.quantity}× {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <span className="font-semibold text-primary-900 text-sm">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full min-h-[44px]"
                  onClick={() => {
                    window.location.href = `/pedidos/${selectedOrder.id}`;
                  }}
                >
                  Ver página completa do pedido
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
