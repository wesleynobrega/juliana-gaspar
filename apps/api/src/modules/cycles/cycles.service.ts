import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateCycleDTO, UpdateCycleDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class CyclesService {
  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      prisma.weeklyCycle.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { cycleDishes: { include: { dish: { select: { id: true, name: true, price: true } } } } } }),
      prisma.weeklyCycle.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Record<string, unknown>> {
    const cycle = await prisma.weeklyCycle.findUnique({
      where: { id },
      include: { cycleDishes: { include: { dish: true } }, orders: true },
    });
    if (!cycle) throw new NotFoundException('Ciclo não encontrado');

    type OrderRow = (typeof cycle.orders)[number];
    const revenue = cycle.orders
      .filter((o: OrderRow) => o.status !== 'CANCELLED')
      .reduce((sum: number, o: OrderRow) => sum + o.totalAmount, 0);

    return { ...cycle, orderCount: cycle.orders.length, revenue };
  }

  async create(dto: CreateCycleDTO): Promise<Record<string, unknown>> {
    const cycle = await prisma.weeklyCycle.create({
      data: {
        openDate: new Date(dto.openDate), closeDate: new Date(dto.closeDate), deliveryDate: new Date(dto.deliveryDate),
        cycleDishes: { create: dto.dishIds.map((dishId: string) => ({ dishId })) },
      },
      include: { cycleDishes: { include: { dish: true } } },
    });
    return cycle;
  }

  async update(id: string, dto: UpdateCycleDTO): Promise<Record<string, unknown>> {
    const existing = await prisma.weeklyCycle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ciclo não encontrado');
    const data: Record<string, unknown> = {};
    if (dto.openDate) data.openDate = new Date(dto.openDate);
    if (dto.closeDate) data.closeDate = new Date(dto.closeDate);
    if (dto.deliveryDate) data.deliveryDate = new Date(dto.deliveryDate);

    await prisma.weeklyCycle.update({ where: { id }, data });

    if (dto.dishIds) {
      await prisma.cycleDish.deleteMany({ where: { cycleId: id } });
      await prisma.cycleDish.createMany({ data: dto.dishIds.map((dishId: string) => ({ cycleId: id, dishId })) });
    }
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.weeklyCycle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ciclo não encontrado');
    await prisma.weeklyCycle.delete({ where: { id } });
  }

  async updateStatus(id: string, status: string): Promise<Record<string, unknown>> {
    const cycle = await prisma.weeklyCycle.findUnique({ where: { id } });
    if (!cycle) throw new NotFoundException('Ciclo não encontrado');

    const validTransitions: Record<string, string[]> = {
      UPCOMING: ['OPEN'],
      OPEN: ['CLOSED'],
      CLOSED: ['COMPLETED'],
    };

    const allowed = validTransitions[cycle.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(`Transição inválida: ${cycle.status} → ${status}`);
    }

    await prisma.weeklyCycle.update({ where: { id }, data: { status } });
    return this.findById(id);
  }

  async updateDishes(id: string, dishIds: string[]): Promise<Record<string, unknown>> {
    const existing = await prisma.weeklyCycle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ciclo não encontrado');

    await prisma.cycleDish.deleteMany({ where: { cycleId: id } });
    if (dishIds.length > 0) {
      await prisma.cycleDish.createMany({ data: dishIds.map((dishId: string) => ({ cycleId: id, dishId })) });
    }
    return this.findById(id);
  }
}
