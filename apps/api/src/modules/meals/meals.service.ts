import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type {
  CreateMealDTO,
  UpdateMealDTO,
  MealDTO,
  OrderComponentDTO,
} from '@juliana-gaspar/contracts';

// ── Types ──────────────────────────────────────────────

type ComponentRow = {
  id: string;
  mealId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
};

type MealWithComponents = {
  id: string;
  orderId: string;
  notes: string | null;
  components: ComponentRow[];
};

// ── Mappers ────────────────────────────────────────────

function toMealDTO(meal: MealWithComponents): MealDTO {
  return {
    id: meal.id,
    orderId: meal.orderId,
    notes: meal.notes ?? null,
    components: meal.components.map((c): OrderComponentDTO => ({
      id: c.id,
      mealId: c.mealId,
      menuItemId: c.menuItemId,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
    })),
  };
}

// ── Helpers ────────────────────────────────────────────

async function recalcOrderTotal(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { meals: { include: { components: true } } },
  });
  if (!order) return;

  const total = order.meals.reduce((sum, meal) => {
    const mealTotal = meal.components.reduce(
      (cSum, c) => cSum + c.quantity * c.unitPrice,
      0,
    );
    return sum + mealTotal;
  }, 0);

  await prisma.order.update({
    where: { id: orderId },
    data: { totalAmount: total },
  });
}

// ── Service ────────────────────────────────────────────

@Injectable()
export class MealsService {
  async findAll(orderId: string): Promise<{ data: MealDTO[]; total: number }> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const [data, total] = await Promise.all([
      prisma.meal.findMany({
        where: { orderId },
        include: { components: true },
        orderBy: { id: 'asc' },
      }),
      prisma.meal.count({ where: { orderId } }),
    ]);
    return {
      data: data.map((m) => toMealDTO(m as unknown as MealWithComponents)),
      total,
    };
  }

  async findById(orderId: string, id: string): Promise<MealDTO> {
    const meal = await prisma.meal.findUnique({
      where: { id, orderId },
      include: { components: true },
    });
    if (!meal) throw new NotFoundException('Prato não encontrado');
    return toMealDTO(meal as unknown as MealWithComponents);
  }

  async create(orderId: string, dto: CreateMealDTO): Promise<MealDTO> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const meal = await prisma.meal.create({
      data: {
        orderId,
        notes: dto.notes ?? null,
        components: {
          create: dto.components.map((c) => ({
            menuItemId: c.menuItemId,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
          })),
        },
      },
      include: { components: true },
    });

    await recalcOrderTotal(orderId);
    return toMealDTO(meal as unknown as MealWithComponents);
  }

  async update(
    orderId: string,
    id: string,
    dto: UpdateMealDTO,
  ): Promise<MealDTO> {
    const existing = await prisma.meal.findUnique({
      where: { id, orderId },
    });
    if (!existing) throw new NotFoundException('Prato não encontrado');

    // Se enviou novos componentes, replace
    if (dto.components) {
      await prisma.orderComponent.deleteMany({ where: { mealId: id } });
    }

    const meal = await prisma.meal.update({
      where: { id },
      data: {
        notes: dto.notes !== undefined ? (dto.notes ?? null) : undefined,
        ...(dto.components
          ? {
              components: {
                create: dto.components.map((c) => ({
                  menuItemId: c.menuItemId,
                  quantity: c.quantity,
                  unitPrice: c.unitPrice,
                })),
              },
            }
          : {}),
      },
      include: { components: true },
    });

    await recalcOrderTotal(orderId);
    return toMealDTO(meal as unknown as MealWithComponents);
  }

  async remove(orderId: string, id: string): Promise<void> {
    const existing = await prisma.meal.findUnique({
      where: { id, orderId },
    });
    if (!existing) throw new NotFoundException('Prato não encontrado');
    await prisma.meal.delete({ where: { id } });
    await recalcOrderTotal(orderId);
  }
}
