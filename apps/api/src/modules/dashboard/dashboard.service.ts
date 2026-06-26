import { Injectable } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { DashboardSummaryDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class DashboardService {
  async getSummary(): Promise<DashboardSummaryDTO> {
    const now = new Date();

    // Semana atual (seg a dom)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const [activeOrders, pendingPayments, totalCustomers, weeklyRevenue, upcomingCycles] =
      await Promise.all([
        prisma.order.count({
          where: { status: { in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION'] } },
        }),
        prisma.payment.count({
          where: {
            status: 'PENDING',
            order: { status: { not: 'CANCELLED' } },
          },
        }),
        prisma.customer.count(),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: 'PAID',
            paidAt: { gte: startOfWeek, lt: endOfWeek },
          },
        }),
        prisma.weeklyCycle.count({
          where: { status: { in: ['UPCOMING', 'OPEN'] } },
        }),
      ]);

    // Utilização de capacidade total nos ciclos atuais
    const currentCycles = await prisma.weeklyCycle.findMany({
      where: { status: { in: ['OPEN', 'UPCOMING'] } },
      select: { id: true, maxClients: true },
      take: 10,
    });

    let totalMax = 0;
    let totalConfirmed = 0;

    if (currentCycles.length > 0) {
      const orderCounts = await Promise.all(
        currentCycles.map((c) =>
          prisma.order.count({
            where: { cycleId: c.id, status: { not: 'CANCELLED' } },
          }),
        ),
      );
      totalMax = currentCycles.reduce((s, c) => s + c.maxClients, 0);
      totalConfirmed = orderCounts.reduce((s, n) => s + n, 0);
    }

    const capacityUtilization =
      totalMax > 0 ? Math.round((totalConfirmed / totalMax) * 100) : 0;

    return {
      activeOrders,
      pendingPayments: pendingPayments,
      totalCustomers,
      weeklyRevenue: weeklyRevenue._sum.amount ?? 0,
      upcomingCycles,
      capacityUtilization,
    };
  }
}
