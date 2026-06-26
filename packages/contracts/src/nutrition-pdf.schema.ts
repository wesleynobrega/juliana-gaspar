import { z } from 'zod';

// ── NutritionistPlan ───────────────────────────────────

export const nutritionistPlanSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  sourcePdfUrl: z.string().url(),
  parsedData: z.record(z.unknown()).nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type NutritionistPlanDTO = z.infer<typeof nutritionistPlanSchema>;

export const uploadPdfSchema = z.object({
  customerId: z.string().uuid(),
  sourcePdfUrl: z.string().url('URL do PDF inválida'),
  notes: z.string().optional().nullable(),
});

export type UploadPdfDTO = z.infer<typeof uploadPdfSchema>;
