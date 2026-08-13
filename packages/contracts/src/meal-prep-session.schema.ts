import { z } from 'zod';

export const mealPrepLocalSchema = z.enum(['CASA_CLIENTE', 'COZINHA_CHEF']);

export type MealPrepLocal = z.infer<typeof mealPrepLocalSchema>;

export const mealPrepStatusSchema = z.enum([
  'AGENDADO',
  'EM_EXECUCAO',
  'CONCLUIDO',
  'CANCELADO',
]);

export type MealPrepStatus = z.infer<typeof mealPrepStatusSchema>;

export const mealPrepSessionSchema = z.object({
  id: z.string().uuid(),
  clienteId: z.string().uuid(),
  mealPlanId: z.string().uuid(),
  clienteName: z.string().optional().nullable(),
  mealPlanDescription: z.string().optional().nullable(),
  date: z.string().datetime(),
  location: mealPrepLocalSchema,
  mealCount: z.number().int().positive().optional().nullable(),
  durationHours: z.number().int().positive().optional().nullable(),
  status: mealPrepStatusSchema,
  groceryService: z.boolean(),
  totalValue: z.number(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MealPrepSessionDTO = z.infer<typeof mealPrepSessionSchema>;

export const createMealPrepSessionSchema = z.object({
  clienteId: z.string().uuid('Cliente inválido'),
  mealPlanId: z.string().uuid('Plano alimentar inválido'),
  date: z.string().datetime('Data inválida'),
  location: mealPrepLocalSchema,
  mealCount: z.number().int().positive().optional().nullable(),
  durationHours: z.number().int().positive().optional().nullable(),
  groceryService: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

export type CreateMealPrepSessionDTO = z.infer<typeof createMealPrepSessionSchema>;

export const updateMealPrepSessionSchema = createMealPrepSessionSchema
  .partial()
  .extend({ status: mealPrepStatusSchema.optional() });

export type UpdateMealPrepSessionDTO = z.infer<typeof updateMealPrepSessionSchema>;
