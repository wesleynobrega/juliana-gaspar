import { z } from 'zod';

export const planoOrigemSchema = z.enum(['PROFISSIONAL_SAUDE', 'EXPERIENCIA_CHEF']);

export type PlanoOrigem = z.infer<typeof planoOrigemSchema>;

export const planoAlimentarSchema = z.object({
  id: z.string().uuid(),
  clienteId: z.string().uuid(),
  clienteName: z.string().optional().nullable(),
  origem: planoOrigemSchema,
  description: z.string(),
  period: z.string().optional().nullable(),
  healthProfessionalName: z.string().optional().nullable(),
  healthProfessionalSpecialty: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PlanoAlimentarDTO = z.infer<typeof planoAlimentarSchema>;

export const createPlanoAlimentarSchema = z.object({
  clienteId: z.string().uuid('Cliente inválido'),
  origem: planoOrigemSchema.default('EXPERIENCIA_CHEF'),
  description: z.string(),
  period: z.string().optional().nullable(),
  healthProfessionalName: z.string().optional().nullable(),
  healthProfessionalSpecialty: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreatePlanoAlimentarDTO = z.infer<typeof createPlanoAlimentarSchema>;

export const updatePlanoAlimentarSchema = createPlanoAlimentarSchema.partial();

export type UpdatePlanoAlimentarDTO = z.infer<typeof updatePlanoAlimentarSchema>;
