import { z } from 'zod';

export const subscriptionStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED']);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const subscriptionSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  planType: z.enum(['WEEKLY', 'MONTHLY']),
  status: subscriptionStatusSchema,
  startDate: z.string().datetime(),
  nextRenewal: z.string().datetime(),
  pausedUntil: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
});

export type SubscriptionDTO = z.infer<typeof subscriptionSchema>;

export const createSubscriptionSchema = z.object({
  customerId: z.string().uuid('Cliente inválido'),
  planType: z.enum(['WEEKLY', 'MONTHLY']),
});

export type CreateSubscriptionDTO = z.infer<typeof createSubscriptionSchema>;

export const pauseSubscriptionSchema = z.object({
  pausedUntil: z.string().datetime('Data de retorno inválida'),
});

export type PauseSubscriptionDTO = z.infer<typeof pauseSubscriptionSchema>;
