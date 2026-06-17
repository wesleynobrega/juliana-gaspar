import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_LABELS } from '@/lib/constants';

const variantByStatus: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  CONFIRMED: 'default',
  IN_PRODUCTION: 'default',
  OUT_FOR_DELIVERY: 'secondary',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
};

const colorByStatus: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  CONFIRMED: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  IN_PRODUCTION: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  DELIVERED: 'bg-green-100 text-green-800 hover:bg-green-100',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-100',
};

type Props = {
  status: string;
  className?: string;
};

export function PedidoStatusBadge({ status, className = '' }: Props) {
  return (
    <Badge variant={variantByStatus[status] ?? 'default'} className={`text-xs whitespace-nowrap ${colorByStatus[status] ?? ''} ${className}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
