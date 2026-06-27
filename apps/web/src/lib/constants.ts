export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  IN_PRODUCTION: 'Em Produção',
  OUT_FOR_DELIVERY: 'Saiu para Entrega',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PRODUCTION: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
  REFUNDED: 'Reembolsado',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export const PLAN_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Único',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
};
