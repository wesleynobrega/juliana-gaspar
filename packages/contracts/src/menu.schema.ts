import { z } from 'zod';

// ── Enums ──────────────────────────────────────────────

export const nutrientTypeSchema = z.enum([
  'PROTEINA',
  'CARBOIDRATO',
  'FIBRA',
  'GORDURA',
]);

export type NutrientType = z.infer<typeof nutrientTypeSchema>;

// ── MenuItem ───────────────────────────────────────────

export const menuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string().nullable(),
  nutrientType: nutrientTypeSchema,
  photoUrl: z.string().url().nullable(),
  allergens: z.string().nullable(),
  baseUnit: z.string().default('porção'),
  available: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MenuItemDTO = z.infer<typeof menuItemSchema>;

export const createMenuItemSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string().optional().nullable(),
  nutrientType: nutrientTypeSchema,
  photoUrl: z.string().url().optional().nullable(),
  allergens: z.string().optional(),
  baseUnit: z.string().default('porção'),
});

export type CreateMenuItemDTO = z.infer<typeof createMenuItemSchema>;

export const updateMenuItemSchema = createMenuItemSchema.partial();

export type UpdateMenuItemDTO = z.infer<typeof updateMenuItemSchema>;

// ── TechnicalSheet ─────────────────────────────────────

export const technicalSheetSchema = z.object({
  id: z.string().uuid(),
  menuItemId: z.string().uuid(),
  preparationMethod: z.string().min(10, 'Descreva o modo de preparo'),
  cookingTime: z.number().int().positive('Tempo deve ser positivo'),
  temperature: z.string().nullable(),
  equipment: z.array(z.string()),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TechnicalSheetDTO = z.infer<typeof technicalSheetSchema>;

export const createTechnicalSheetSchema = z.object({
  preparationMethod: z.string().min(10, 'Descreva o modo de preparo'),
  cookingTime: z.number().int().positive('Tempo deve ser positivo'),
  temperature: z.string().optional().nullable(),
  equipment: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
});

export type CreateTechnicalSheetDTO = z.infer<typeof createTechnicalSheetSchema>;

export const updateTechnicalSheetSchema = createTechnicalSheetSchema.partial();

export type UpdateTechnicalSheetDTO = z.infer<typeof updateTechnicalSheetSchema>;

// ── SpecialRequest ─────────────────────────────────────

export const specialRequestStatusSchema = z.enum(['PENDING', 'FULFILLED']);

export type SpecialRequestStatus = z.infer<typeof specialRequestStatusSchema>;

export const specialRequestSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid().nullable(),
  description: z.string().min(5, 'Descreva o pedido especial'),
  nutrientType: nutrientTypeSchema.nullable(),
  status: specialRequestStatusSchema,
  createdAt: z.string().datetime(),
});

export type SpecialRequestDTO = z.infer<typeof specialRequestSchema>;

export const createSpecialRequestSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  description: z.string().min(5, 'Descreva o pedido especial'),
  nutrientType: nutrientTypeSchema.optional(),
});

export type CreateSpecialRequestDTO = z.infer<typeof createSpecialRequestSchema>;

export const updateSpecialRequestSchema = createSpecialRequestSchema.partial().extend({
  status: specialRequestStatusSchema.optional(),
});

export type UpdateSpecialRequestDTO = z.infer<typeof updateSpecialRequestSchema>;
