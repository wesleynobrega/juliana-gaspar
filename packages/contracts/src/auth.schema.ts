import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginDTO = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  phone: z.string().min(10, 'Telefone inválido').max(15),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

export const userRoleSchema = z.enum(['ADMIN', 'OPERATOR', 'VIEWER']);

export type UserRole = z.infer<typeof userRoleSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: userRoleSchema,
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
