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

// ── FavoriteMeal ───────────────────────────────────────

export const favoriteMealSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  label: z.string(),
  proteinId: z.string().uuid(),
  carboId: z.string().uuid(),
  fiberId: z.string().uuid(),
  fatId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});

export type FavoriteMealDTO = z.infer<typeof favoriteMealSchema>;

export const createFavoriteMealSchema = z.object({
  label: z.string().min(1, 'Dê um nome ao favorito'),
  proteinId: z.string().uuid('Proteína é obrigatória'),
  carboId: z.string().uuid('Carboidrato é obrigatório'),
  fiberId: z.string().uuid('Fibra é obrigatória'),
  fatId: z.string().uuid().nullable().optional(),
});

export type CreateFavoriteMealDTO = z.infer<typeof createFavoriteMealSchema>;

// ── MealTemplate (for creating multiple meals in one order) ──

export const mealTemplateSchema = z.object({
  slot: z.number().int().min(1),
  proteinId: z.string().uuid('Proteína é obrigatória'),
  carboId: z.string().uuid('Carboidrato é obrigatório'),
  fiberId: z.string().uuid('Fibra é obrigatória'),
  fatId: z.string().uuid().nullable().optional(),
  notes: z.string().optional().nullable(),
  copyFromSlot: z.number().int().min(1).optional(),
});

export type MealTemplateDTO = z.infer<typeof mealTemplateSchema>;
