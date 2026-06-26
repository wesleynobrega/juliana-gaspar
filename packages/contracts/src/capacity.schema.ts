import { z } from 'zod';

// ── WaitlistEntry ──────────────────────────────────────

export const waitlistEntrySchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  cycleId: z.string().uuid(),
  position: z.number().int().nonnegative(),
  status: z.enum(['WAITING', 'NOTIFIED', 'CONVERTED', 'CANCELLED']),
  createdAt: z.string().datetime(),
});

export type WaitlistEntryDTO = z.infer<typeof waitlistEntrySchema>;

export const createWaitlistEntrySchema = z.object({
  customerId: z.string().uuid(),
  cycleId: z.string().uuid(),
});

export type CreateWaitlistEntryDTO = z.infer<typeof createWaitlistEntrySchema>;

// ── CapacityStatus (response) ──────────────────────────

export const capacityStatusSchema = z.object({
  cycleId: z.string().uuid(),
  maxClients: z.number().int().nonnegative(),
  confirmedClients: z.number().int().nonnegative(),
  availableSlots: z.number().int().nonnegative(),
  isFull: z.boolean(),
  waitlistCount: z.number().int().nonnegative(),
  nextCycleDate: z.string().datetime().nullable(),
});

export type CapacityStatusDTO = z.infer<typeof capacityStatusSchema>;
