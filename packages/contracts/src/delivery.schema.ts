import { z } from 'zod';

export const deliveryZoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome muito curto'),
  fee: z.number().nonnegative('Taxa não pode ser negativa'),
  description: z.string().optional(),
});

export type DeliveryZoneDTO = z.infer<typeof deliveryZoneSchema>;

export const createDeliveryZoneSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  fee: z.number().nonnegative('Taxa não pode ser negativa'),
  description: z.string().optional(),
});

export type CreateDeliveryZoneDTO = z.infer<typeof createDeliveryZoneSchema>;
