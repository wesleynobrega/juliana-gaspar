import { z } from 'zod';

// ── Enum ───────────────────────────────────────────────

export const mealTypeSchema = z.enum(['ALMOCO', 'JANTA', 'ALMOCO_JANTA']);

export type MealType = z.infer<typeof mealTypeSchema>;

// ── OrderComponent ─────────────────────────────────────

export const orderComponentSchema = z.object({
  id: z.string().uuid(),
  mealId: z.string().uuid(),
  menuItemId: z.string().uuid(),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  unitPrice: z.number().nonnegative('Preço não pode ser negativo'),
});

export type OrderComponentDTO = z.infer<typeof orderComponentSchema>;

export const createOrderComponentSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().positive('Quantidade deve ser positiva').default(1),
  unitPrice: z.number().nonnegative('Preço não pode ser negativo'),
});

export type CreateOrderComponentDTO = z.infer<typeof createOrderComponentSchema>;

// ── Meal ───────────────────────────────────────────────

export const mealSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  notes: z.string().nullable(),
  components: z.array(orderComponentSchema),
});

export type MealDTO = z.infer<typeof mealSchema>;

export const createMealSchema = z.object({
  notes: z.string().optional().nullable(),
  components: z
    .array(createOrderComponentSchema)
    .min(2, 'O prato precisa de pelo menos 2 componentes'),
});

export type CreateMealDTO = z.infer<typeof createMealSchema>;

export const updateMealSchema = z.object({
  notes: z.string().optional().nullable(),
  components: z
    .array(createOrderComponentSchema)
    .min(2, 'O prato precisa de pelo menos 2 componentes')
    .optional(),
});

export type UpdateMealDTO = z.infer<typeof updateMealSchema>;
