'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  MEAL_PREP_STATUS_LABELS,
  MEAL_PREP_STATUS_COLORS,
  MEAL_PREP_LOCAL_LABELS,
} from '@/lib/constants';
import { Users, ClipboardList, CalendarClock, MapPin } from 'lucide-react';

// ── Types ─────────────────────────────────────────────

interface MealPrepSessionDTO {
  id: string;
  clienteName: string | null;
  mealPlanDescription: string | null;
  date: string;
  location: string;
  status: string;
  totalValue: number;
}

// ── Page ───────────────────────────────────────────────

export default function DashboardPage() {
  const [totalClientes, setTotalClientes] = useState<number | null>(null);
  const [totalPlanos, setTotalPlanos] = useState<number | null>(null);
  const [proximasSessoes, setProximasSessoes] = useState<MealPrepSessionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [clientesRes, planosRes, sessoesRes] = await Promise.all([
          api.get<{ total: number }>('/clients?limit=1'),
          api.get<{ total: number }>('/meal-plans?limit=1'),
          api.get<{ data: MealPrepSessionDTO[] }>('/meal-prep-sessions?limit=100'),
        ]);

        setTotalClientes(clientesRes.total ?? 0);
        setTotalPlanos(planosRes.total ?? 0);

        const now = Date.now();
        const proximas = (sessoesRes.data ?? [])
          .filter((s) => s.status === 'AGENDADO' && new Date(s.date).getTime() >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        setProximasSessoes(proximas);
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
    { label: 'Clientes', value: totalClientes ?? 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Planos Alimentares', value: totalPlanos ?? 0, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Próximas Sessões', value: proximasSessoes.length, icon: CalendarClock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

      {/* Próximas sessões */}
      <Card className="border-primary-100">
        <CardHeader>
          <CardTitle className="font-display text-lg text-primary-900">Próximas Sessões de Meal Prep</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : proximasSessoes.length === 0 ? (
            <EmptyState title="Nenhuma sessão agendada" description="Agende uma sessão de meal prep na aba Meal Prep." />
          ) : (
            <div className="space-y-2">
              {proximasSessoes.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-3 px-3 rounded-lg border border-primary-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-primary-900 text-sm truncate">
                      {s.clienteName ?? 'Cliente'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-primary-400 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" />
                        {formatDate(s.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {MEAL_PREP_LOCAL_LABELS[s.location] ?? s.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-700">{formatCurrency(s.totalValue)}</span>
                    <Badge className={`text-xs ${MEAL_PREP_STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-800'}`}>
                      {MEAL_PREP_STATUS_LABELS[s.status] || s.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
