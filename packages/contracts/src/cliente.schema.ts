import { z } from 'zod';

export const clienteSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().nullable(),
  address: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  dietaryRestrictions: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
  healthProfessionalName: z.string().optional().nullable(),
  healthProfessionalSpecialty: z.string().optional().nullable(),
  lgpdConsent: z.boolean(),
  tags: z.array(z.string()),
  notes: z.string().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ClienteDTO = z.infer<typeof clienteSchema>;

export const createClienteSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().nullable(),
  address: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  dietaryRestrictions: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
  healthProfessionalName: z.string().optional().nullable(),
  healthProfessionalSpecialty: z.string().optional().nullable(),
  lgpdConsent: z.boolean().refine((v) => v === true, {
    message: 'Consentimento LGPD é obrigatório',
  }),
  notes: z.string().optional().nullable(),
});

export type CreateClienteDTO = z.infer<typeof createClienteSchema>;

export const updateClienteSchema = createClienteSchema.partial();

export type UpdateClienteDTO = z.infer<typeof updateClienteSchema>;
