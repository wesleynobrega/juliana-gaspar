import type { OrderStatus, PaymentStatus, PlanType } from '@juliana-gaspar/contracts';

export type PedidoFilter = {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus;
  planType?: PlanType;
  search?: string;
};

export type PedidoListItem = {
  id: string;
  customerName: string;
  customerPhone: string;
  planType: PlanType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  deliveryDate: string | null;
  createdAt: string;
};
