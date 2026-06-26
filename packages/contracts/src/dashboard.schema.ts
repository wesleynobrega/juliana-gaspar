import { z } from 'zod';

export const dashboardSummarySchema = z.object({
  activeOrders: z.number().int().nonnegative(),
  pendingPayments: z.number().int().nonnegative(),
  totalCustomers: z.number().int().nonnegative(),
  weeklyRevenue: z.number().nonnegative(),
  upcomingCycles: z.number().int().nonnegative(),
  capacityUtilization: z.number().min(0).max(100),
});

export type DashboardSummaryDTO = z.infer<typeof dashboardSummarySchema>;
