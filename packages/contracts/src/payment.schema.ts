import { z } from 'zod';

export const paymentMethodSchema = z.enum(['PIX', 'CREDIT_CARD', 'PAYMENT_LINK']);

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const paymentSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  method: paymentMethodSchema,
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'REFUNDED']),
  amount: z.number().positive(),
  paidAt: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
});

export type PaymentDTO = z.infer<typeof paymentSchema>;

export const createPaymentSchema = z.object({
  orderId: z.string().uuid('Pedido inválido'),
  method: paymentMethodSchema,
  amount: z.number().positive('Valor deve ser positivo'),
});

export type CreatePaymentDTO = z.infer<typeof createPaymentSchema>;

export const registerPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  paidAt: z.string().datetime().optional(),
});

export type RegisterPaymentDTO = z.infer<typeof registerPaymentSchema>;
