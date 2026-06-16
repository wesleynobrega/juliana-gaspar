import { z } from 'zod';

export const cycleStatusSchema = z.enum(['UPCOMING', 'OPEN', 'CLOSED', 'COMPLETED']);

export type CycleStatus = z.infer<typeof cycleStatusSchema>;

export const weeklyCycleSchema = z.object({
  id: z.string().uuid(),
  openDate: z.string().datetime(),
  closeDate: z.string().datetime(),
  deliveryDate: z.string().datetime(),
  status: cycleStatusSchema,
  dishes: z.array(z.string().uuid()),
  createdAt: z.string().datetime(),
});

export type WeeklyCycleDTO = z.infer<typeof weeklyCycleSchema>;

export const createCycleSchema = z.object({
  openDate: z.string().datetime('Data de abertura inválida'),
  closeDate: z.string().datetime('Data de fechamento inválida'),
  deliveryDate: z.string().datetime('Data de entrega inválida'),
  dishIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos 1 prato'),
});

export type CreateCycleDTO = z.infer<typeof createCycleSchema>;

export const updateCycleSchema = createCycleSchema.partial();

export type UpdateCycleDTO = z.infer<typeof updateCycleSchema>;
