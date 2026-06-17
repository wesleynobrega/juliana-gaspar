'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { PedidoStatusBadge } from './pedido-status-badge';
import type { PedidoListItem } from '../types';

type Props = { pedido: PedidoListItem; onPress: (id: string) => void };

export function PedidoCard({ pedido, onPress }: Props) {
  return (
    <Card
      className="cursor-pointer active:bg-primary-50/50 min-h-[88px] transition-colors border-primary-100"
      onClick={() => onPress(pedido.id)}
      role="button"
      tabIndex={0}
      aria-label={`Pedido de ${pedido.customerName}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onPress(pedido.id);
      }}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-primary-900">{pedido.customerName}</h3>
            <p className="text-xs text-primary-400">#{pedido.id.slice(0, 8)}</p>
          </div>
          <PedidoStatusBadge status={pedido.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-primary-400">{pedido.itemCount} itens</span>
          <span className="font-bold text-primary-900 text-sm">{formatCurrency(pedido.totalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
