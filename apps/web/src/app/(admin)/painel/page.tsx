'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCart,
  Users,
  DollarSign,
  UtensilsCrossed,
} from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface OrderSummary {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
}

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  dishesCount: number;
  recentOrders: OrderSummary[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, customersRes, dishesRes, allOrdersRes] =
          await Promise.all([
            api.get<PaginatedResponse<OrderSummary>>('/orders?limit=5'),
            api.get<PaginatedResponse<unknown>>('/customers?limit=1'),
            api.get<PaginatedResponse<unknown>>('/dishes?limit=1'),
            api.get<PaginatedResponse<OrderSummary>>('/orders?limit=100'),
          ]);

        const totalRevenue =
          allOrdersRes.data?.reduce(
            (sum, o) => (o.status !== 'CANCELLED' ? sum + o.totalAmount : sum),
            0,
          ) ?? 0;

        setData({
          totalOrders: allOrdersRes.total ?? 0,
          totalRevenue,
          activeCustomers: customersRes.total ?? 0,
          dishesCount: dishesRes.total ?? 0,
          recentOrders: ordersRes.data ?? [],
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const kpis = [
    {
      label: 'Pedidos',
      value: data?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Faturamento',
      value: formatCurrency(data?.totalRevenue ?? 0),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Clientes',
      value: data?.activeCustomers ?? 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Pratos',
      value: data?.dishesCount ?? 0,
      icon: UtensilsCrossed,
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
                    <span className="text-sm text-primary-500">
                      {kpi.label}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}
                    >
                      <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-primary-900">
                    {kpi.value}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-primary-100">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data?.recentOrders?.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-primary-50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-primary-900 text-sm">
                      {order.customerName || 'Cliente'}
                    </p>
                    <p className="text-xs text-primary-400">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className="font-semibold text-primary-900 text-sm">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
              {(!data?.recentOrders ||
                data.recentOrders.length === 0) && (
                <p className="text-center text-primary-400 py-8">
                  Nenhum pedido recente.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
