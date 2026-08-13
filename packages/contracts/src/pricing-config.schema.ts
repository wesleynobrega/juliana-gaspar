import { z } from 'zod';

export const pricingConfigSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.number(),
  description: z.string().optional().nullable(),
  active: z.boolean(),
  updatedAt: z.string().datetime(),
});

export type PricingConfigDTO = z.infer<typeof pricingConfigSchema>;

export const updatePricingConfigSchema = z.object({
  value: z.number().nonnegative('Valor deve ser não negativo'),
  description: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export type UpdatePricingConfigDTO = z.infer<typeof updatePricingConfigSchema>;
