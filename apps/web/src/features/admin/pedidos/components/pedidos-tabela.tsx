'use client';

import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/lib/constants';
import { PedidoStatusBadge } from './pedido-status-badge';
import type { PedidoListItem } from '../types';

type Props = {
  pedidos: PedidoListItem[];
};

export function PedidosTabela({ pedidos }: Props) {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-primary-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary-50">
            <th className="text-left py-3 px-4 font-medium text-primary-600">Cliente</th>
            <th className="text-left py-3 px-4 font-medium text-primary-600 hidden sm:table-cell">
              Data
            </th>
            <th className="text-left py-3 px-4 font-medium text-primary-600">Status</th>
            <th className="text-left py-3 px-4 font-medium text-primary-600 hidden md:table-cell">
              Pagamento
            </th>
            <th className="text-right py-3 px-4 font-medium text-primary-600">Valor</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr
              key={pedido.id}
              className="border-t border-primary-50 hover:bg-primary-50/30 transition-colors cursor-pointer min-h-[44px]"
              onClick={() => router.push(`/pedidos/${pedido.id}`)}
            >
              <td className="py-3 px-4">
                <p className="font-medium text-primary-900">{pedido.customerName}</p>
                <p className="text-xs text-primary-400">#{pedido.id.slice(0, 8)}</p>
              </td>
              <td className="py-3 px-4 text-primary-400 hidden sm:table-cell">
                {formatDate(pedido.createdAt)}
              </td>
              <td className="py-3 px-4">
                <PedidoStatusBadge status={pedido.status} />
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <Badge
                  variant="outline"
                  className={`text-xs ${PAYMENT_STATUS_COLORS[pedido.paymentStatus] ?? ''}`}
                >
                  {PAYMENT_STATUS_LABELS[pedido.paymentStatus] ?? pedido.paymentStatus}
                </Badge>
              </td>
              <td className="py-3 px-4 text-right font-semibold text-primary-900">
                {formatCurrency(pedido.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
