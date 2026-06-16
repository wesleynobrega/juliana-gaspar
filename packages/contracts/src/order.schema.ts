import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'IN_PRODUCTION',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const paymentStatusSchema = z.enum(['PENDING', 'PAID', 'OVERDUE', 'REFUNDED']);

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const planTypeSchema = z.enum(['SINGLE', 'WEEKLY', 'MONTHLY']);

export type PlanType = z.infer<typeof planTypeSchema>;

export const orderItemSchema = z.object({
  id: z.string().uuid(),
  dishId: z.string().uuid(),
  dishName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

export type OrderItemDTO = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  customerName: z.string(),
  cycleId: z.string().uuid().optional(),
  planType: planTypeSchema,
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  totalAmount: z.number().positive(),
  deliveryAddress: z.string(),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema),
  createdAt: z.string().datetime(),
});

export type OrderDTO = z.infer<typeof orderSchema>;

export const createOrderSchema = z.object({
  customerId: z.string().uuid('Cliente inválido'),
  cycleId: z.string().uuid().optional(),
  planType: planTypeSchema,
  deliveryAddress: z.string().min(10, 'Endereço muito curto').max(500),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        dishId: z.string().uuid('Prato inválido'),
        quantity: z.number().int().min(1, 'Mínimo 1 unidade'),
      }),
    )
    .min(1, 'Pedido deve ter pelo menos 1 prato'),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  notes: z.string().max(500).optional(),
});

export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;
