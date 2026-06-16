import { z } from 'zod';

export const dishSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string().min(10, 'Descrição muito curta').max(500),
  photoUrl: z.string().url().nullable(),
  ingredients: z.string().min(3, 'Liste os ingredientes'),
  allergens: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  available: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DishDTO = z.infer<typeof dishSchema>;

export const createDishSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string().min(10, 'Descrição muito curta').max(500),
  photoUrl: z.string().url().optional().nullable(),
  ingredients: z.string().min(3, 'Liste os ingredientes'),
  allergens: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  available: z.boolean().default(true),
});

export type CreateDishDTO = z.infer<typeof createDishSchema>;

export const updateDishSchema = createDishSchema.partial();

export type UpdateDishDTO = z.infer<typeof updateDishSchema>;
