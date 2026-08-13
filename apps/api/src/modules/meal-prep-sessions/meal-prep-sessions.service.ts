import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateMealPrepSessionDTO, UpdateMealPrepSessionDTO, MealPrepSessionDTO } from '@juliana-gaspar/contracts';
import { PricingService } from '../pricing-config/pricing.service';

function toDTO(s: Record<string, unknown> & {
  cliente?: { name: string } | null;
  mealPlan?: { description: string } | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}): MealPrepSessionDTO {
  return {
    ...s,
    date: s.date.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    clienteName: s.cliente?.name ?? null,
    mealPlanDescription: s.mealPlan?.description ?? null,
  } as MealPrepSessionDTO;
}

@Injectable()
export class MealPrepSessionsService {
  constructor(private pricingService: PricingService) {}

  async findAll(page = 1, limit = 20, clienteId?: string) {
    const where = clienteId ? { clienteId } : {};
    const [data, total] = await Promise.all([
      prisma.mealPrepSession.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          cliente: { select: { name: true } },
          mealPlan: { select: { description: true } },
        },
      }),
      prisma.mealPrepSession.count({ where }),
    ]);
    return { data: data.map(toDTO), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<MealPrepSessionDTO> {
    const s = await prisma.mealPrepSession.findUnique({
      where: { id },
      include: {
        cliente: { select: { name: true } },
        mealPlan: { select: { description: true } },
      },
    });
    if (!s) throw new NotFoundException('Sessão de meal prep não encontrada');
    return toDTO(s);
  }

  async create(dto: CreateMealPrepSessionDTO): Promise<MealPrepSessionDTO> {
    const cliente = await prisma.cliente.findUnique({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    const mealPlan = await prisma.planoAlimentar.findUnique({ where: { id: dto.mealPlanId } });
    if (!mealPlan) throw new NotFoundException('Plano alimentar não encontrado');

    const totalValue = await this.pricingService.computeMealPrepTotal(dto.location, dto.groceryService);

    const s = await prisma.mealPrepSession.create({
      data: { ...dto, date: new Date(dto.date), totalValue },
      include: {
        cliente: { select: { name: true } },
        mealPlan: { select: { description: true } },
      },
    });
    return toDTO(s);
  }

  async update(id: string, dto: UpdateMealPrepSessionDTO): Promise<MealPrepSessionDTO> {
    const existing = await prisma.mealPrepSession.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Sessão de meal prep não encontrada');
    if (dto.clienteId) {
      const cliente = await prisma.cliente.findUnique({ where: { id: dto.clienteId } });
      if (!cliente) throw new NotFoundException('Cliente não encontrado');
    }
    if (dto.mealPlanId) {
      const mealPlan = await prisma.planoAlimentar.findUnique({ where: { id: dto.mealPlanId } });
      if (!mealPlan) throw new NotFoundException('Plano alimentar não encontrado');
    }

    const location = dto.location ?? existing.location;
    const groceryService = dto.groceryService ?? existing.groceryService;
    const totalValue = await this.pricingService.computeMealPrepTotal(location, groceryService);

    const data: Record<string, unknown> = { ...dto, totalValue };
    if (dto.date) data.date = new Date(dto.date);

    const s = await prisma.mealPrepSession.update({
      where: { id },
      data,
      include: {
        cliente: { select: { name: true } },
        mealPlan: { select: { description: true } },
      },
    });
    return toDTO(s);
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.mealPrepSession.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Sessão de meal prep não encontrada');
    await prisma.mealPrepSession.delete({ where: { id } });
  }
}
