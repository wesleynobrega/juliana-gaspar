import { z } from 'zod';

export const recipeItemSchema = z.object({
  id: z.string().uuid(),
  dishId: z.string().uuid(),
  ingredientId: z.string().uuid(),
  ingredientName: z.string(),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  unit: z.string(),
});

export type RecipeItemDTO = z.infer<typeof recipeItemSchema>;

export const createRecipeItemSchema = z.object({
  dishId: z.string().uuid('Prato inválido'),
  ingredientId: z.string().uuid('Ingrediente inválido'),
  quantity: z.number().positive('Quantidade deve ser positiva'),
});

export type CreateRecipeItemDTO = z.infer<typeof createRecipeItemSchema>;

export const updateRecipeItemSchema = createRecipeItemSchema.partial();

export type UpdateRecipeItemDTO = z.infer<typeof updateRecipeItemSchema>;
