import { z } from 'zod';
import { mealTypeSchema, mealSchema, mealTemplateSchema } from './meal.schema';

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
  mealType: mealTypeSchema,
  nutritionistPlanId: z.string().uuid().nullable().optional(),
  sourcePdfUrl: z.string().url().nullable().optional(),
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  totalAmount: z.number().positive(),
  deliveryAddress: z.string(),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema),
  meals: z.array(mealSchema).optional(),
  createdAt: z.string().datetime(),
});

export type OrderDTO = z.infer<typeof orderSchema>;

// Legacy create (dish-based)
export const createOrderSchema = z.object({
  customerId: z.string().uuid('Cliente inválido'),
  cycleId: z.string().uuid().optional(),
  planType: planTypeSchema,
  mealType: mealTypeSchema.default('ALMOCO_JANTA'),
  nutritionistPlanId: z.string().uuid().optional().nullable(),
  sourcePdfUrl: z.string().url().optional().nullable(),
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

// v2.1 meal-based create
export const createMealBasedOrderSchema = z.object({
  customerId: z.string().uuid('Cliente inválido'),
  cycleId: z.string().uuid().optional(),
  planType: planTypeSchema.default('SINGLE'),
  mealType: mealTypeSchema.default('ALMOCO_JANTA'),
  deliveryAddress: z.string().min(10, 'Endereço muito curto').max(500),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  mealCount: z.union([z.literal(7), z.literal(14)]),
  meals: z.array(mealTemplateSchema).min(7, 'Mínimo 7 refeições'),
});

export type CreateMealBasedOrderDTO = z.infer<typeof createMealBasedOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  notes: z.string().max(500).optional(),
});

export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;

// Purchase suggestion
export const purchaseSuggestionItemSchema = z.object({
  ingredientId: z.string().uuid(),
  ingredientName: z.string(),
  unit: z.string(),
  currentStock: z.number(),
  requiredQty: z.number(),
  suggestedPurchase: z.number(),
});

export type PurchaseSuggestionItemDTO = z.infer<typeof purchaseSuggestionItemSchema>;

export const purchaseSuggestionSchema = z.object({
  confirmedOrders: z.number(),
  items: z.array(purchaseSuggestionItemSchema),
});

export type PurchaseSuggestionDTO = z.infer<typeof purchaseSuggestionSchema>;
