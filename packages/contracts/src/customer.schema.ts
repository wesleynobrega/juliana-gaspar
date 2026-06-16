import { z } from 'zod';

export const customerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().nullable(),
  address: z.string().optional().nullable(),
  dietaryRestrictions: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
  lgpdConsent: z.boolean(),
  tags: z.array(z.string()),
  notes: z.string().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CustomerDTO = z.infer<typeof customerSchema>;

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().nullable(),
  address: z.string().optional().nullable(),
  dietaryRestrictions: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
  lgpdConsent: z.boolean().refine((v) => v === true, {
    message: 'Consentimento LGPD é obrigatório',
  }),
  notes: z.string().optional().nullable(),
});

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();

export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;

export const customerTagSchema = z.enum(['ACTIVE', 'INACTIVE', 'VIP', 'AT_RISK']);

export type CustomerTag = z.infer<typeof customerTagSchema>;
