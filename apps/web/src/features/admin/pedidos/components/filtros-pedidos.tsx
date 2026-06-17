'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PLAN_TYPE_LABELS } from '@/lib/constants';
import type { PedidoFilter } from '../types';

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const PAYMENT_OPTIONS = Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const PLAN_OPTIONS = Object.entries(PLAN_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

type Props = {
  filters: PedidoFilter;
  onChange: (filters: PedidoFilter) => void;
};

export function FiltrosPedidos({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Input
        placeholder="Buscar cliente..."
        value={filters.search ?? ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
        className="max-w-[200px] min-h-[44px] text-sm"
      />

      <Select
        value={filters.status?.[0] ?? 'all'}
        onValueChange={(value) =>
          onChange({ ...filters, status: value === 'all' ? undefined : [value as never] })
        }
      >
        <SelectTrigger className="min-h-[44px] w-[160px] text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.paymentStatus ?? 'all'}
        onValueChange={(value) =>
          onChange({
            ...filters,
            paymentStatus: value === 'all' ? undefined : (value as PedidoFilter['paymentStatus']),
          })
        }
      >
        <SelectTrigger className="min-h-[44px] w-[160px] text-sm">
          <SelectValue placeholder="Pagamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos pagamentos</SelectItem>
          {PAYMENT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.planType ?? 'all'}
        onValueChange={(value) =>
          onChange({
            ...filters,
            planType: value === 'all' ? undefined : (value as PedidoFilter['planType']),
          })
        }
      >
        <SelectTrigger className="min-h-[44px] w-[140px] text-sm">
          <SelectValue placeholder="Plano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos planos</SelectItem>
          {PLAN_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
