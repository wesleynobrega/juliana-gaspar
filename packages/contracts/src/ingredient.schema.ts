import { z } from 'zod';

export const ingredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome muito curto'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  stockQty: z.number().nonnegative(),
  minStock: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type IngredientDTO = z.infer<typeof ingredientSchema>;

export const createIngredientSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  stockQty: z.number().nonnegative().default(0),
  minStock: z.number().nonnegative().default(0),
});

export type CreateIngredientDTO = z.infer<typeof createIngredientSchema>;

export const updateIngredientSchema = createIngredientSchema.partial();

export type UpdateIngredientDTO = z.infer<typeof updateIngredientSchema>;
