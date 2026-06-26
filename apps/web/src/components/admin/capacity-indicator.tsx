'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

interface CapacityStatus {
  cycleId: string;
  maxClients: number;
  confirmedClients: number;
  availableSlots: number;
  isFull: boolean;
  waitlistCount: number;
  nextCycleDate: string | null;
}

interface CapacityIndicatorProps {
  cycleId: string;
}

export function CapacityIndicator({ cycleId }: CapacityIndicatorProps) {
  const [status, setStatus] = useState<CapacityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<CapacityStatus>(`/capacity/${cycleId}`);
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) setError('Não foi possível carregar a capacidade.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [cycleId]);

  if (loading) {
    return (
      <div className="bg-cream border border-primary-100 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-primary-100 rounded w-1/2 mb-2" />
        <div className="h-3 bg-primary-50 rounded w-3/4" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="bg-cream border border-primary-100 rounded-xl p-4 text-sm text-primary-400">
        Capacidade indisponível
      </div>
    );
  }

  const percentage = Math.min(
    100,
    Math.round((status.confirmedClients / status.maxClients) * 100),
  );

  return (
    <div className="bg-cream border border-primary-100 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-primary-800 mb-3">
        Capacidade do Ciclo
      </h3>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-primary-600 mb-1">
          <span>
            {status.confirmedClients}/{status.maxClients} clientes
          </span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-primary-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status.isFull ? 'bg-red-500' : percentage > 75 ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-sm mb-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            status.isFull ? 'bg-red-500' : 'bg-green-500'
          }`}
        />
        <span className={status.isFull ? 'text-red-700 font-medium' : 'text-green-700'}>
          {status.isFull
            ? 'Ciclo lotado'
            : `${status.availableSlots} vaga${status.availableSlots !== 1 ? 's' : ''} disponíve${status.availableSlots === 1 ? 'l' : 'is'}`}
        </span>
      </div>

      {/* Waitlist */}
      {status.waitlistCount > 0 && (
        <p className="text-xs text-primary-500">
          {status.waitlistCount} cliente
          {status.waitlistCount !== 1 ? 's' : ''} na lista de espera
        </p>
      )}

      {status.nextCycleDate && (
        <p className="text-xs text-primary-400 mt-2">
          Próxima entrega:{' '}
          {new Date(status.nextCycleDate).toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  );
}
