import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateOrderDTO, UpdateOrderStatusDTO, OrderDTO, OrderItemDTO, CreateMealBasedOrderDTO } from '@juliana-gaspar/contracts';

type OrderItemWithDish = {
  id: string;
  dishId: string;
  orderId: string;
  quantity: number;
  unitPrice: number;
  dish: { name: string };
};

type OrderWithIncludes = {
  id: string;
  customerId: string;
  customer: { name: string; phone: string };
  cycleId: string | null;
  planType: string;
  mealType: string;
  nutritionistPlanId: string | null;
  sourcePdfUrl: string | null;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryAddress: string;
  deliveryDate: Date | null;
  notes: string | null;
  createdAt: Date;
  items: OrderItemWithDish[];
};

type DishRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  photoUrl: string | null;
  ingredients: string;
  allergens: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class OrdersService {
  async findAll(params: {
    page: number;
    limit: number;
    status?: string;
    paymentStatus?: string;
    planType?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) {
    const { page, limit, status, paymentStatus, planType, customerId, dateFrom, dateTo, search } = params;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (planType) where.planType = planType;
    if (customerId) where.customerId = customerId;
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.gte = new Date(dateFrom);
      if (dateTo) createdAt.lte = new Date(dateTo);
      where.createdAt = createdAt;
    }
    if (search) {
      where.customer = { name: { contains: search, mode: 'insensitive' as const } };
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' as const },
        include: {
          customer: { select: { name: true, phone: true } },
          items: { include: { dish: { select: { name: true } } } },
          meals: { include: { components: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const typedData = data as unknown as (OrderWithIncludes & { meals?: Array<{ id: string; orderId: string; notes: string | null; components: Array<{ id: string; mealId: string; menuItemId: string; quantity: number; unitPrice: number }> }> })[];

    const mapped: OrderDTO[] = typedData.map((o) => ({
      id: o.id,
      customerId: o.customerId,
      customerName: o.customer.name,
      cycleId: o.cycleId ?? undefined,
      planType: o.planType as OrderDTO['planType'],
      mealType: o.mealType as OrderDTO['mealType'],
      nutritionistPlanId: o.nutritionistPlanId ?? undefined,
      sourcePdfUrl: o.sourcePdfUrl ?? undefined,
      status: o.status as OrderDTO['status'],
      paymentStatus: o.paymentStatus as OrderDTO['paymentStatus'],
      totalAmount: o.totalAmount,
      deliveryAddress: o.deliveryAddress,
      deliveryDate: o.deliveryDate?.toISOString() ?? undefined,
      notes: o.notes ?? undefined,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i: OrderItemWithDish): OrderItemDTO => ({
        id: i.id,
        dishId: i.dishId,
        dishName: i.dish.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      meals: o.meals?.map((m) => ({
        id: m.id,
        orderId: m.orderId,
        notes: m.notes ?? null,
        components: m.components.map((c) => ({
          id: c.id,
          mealId: c.mealId,
          menuItemId: c.menuItemId,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
        })),
      })),
    }));

    return { data: mapped, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<OrderDTO> {
    const o = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, phone: true } },
        items: { include: { dish: { select: { name: true } } } },
        meals: { include: { components: true } },
      },
    });

    if (!o) throw new NotFoundException('Pedido não encontrado');

    return {
      id: o.id,
      customerId: o.customerId,
      customerName: (o as Record<string, unknown>).customer as string,
      cycleId: o.cycleId ?? undefined,
      planType: o.planType as OrderDTO['planType'],
      mealType: o.mealType as OrderDTO['mealType'],
      nutritionistPlanId: o.nutritionistPlanId ?? undefined,
      sourcePdfUrl: o.sourcePdfUrl ?? undefined,
      status: o.status as OrderDTO['status'],
      paymentStatus: o.paymentStatus as OrderDTO['paymentStatus'],
      totalAmount: o.totalAmount,
      deliveryAddress: o.deliveryAddress,
      deliveryDate: o.deliveryDate?.toISOString() ?? undefined,
      notes: o.notes ?? undefined,
      createdAt: o.createdAt.toISOString(),
      items: (o as Record<string, unknown>).items as OrderItemDTO[],
      meals: ((o as Record<string, unknown>).meals as Array<Record<string, unknown>>)?.map((m) => ({
        id: m.id,
        orderId: m.orderId,
        notes: (m.notes as string) ?? null,
        components: (m.components as Array<Record<string, unknown>>).map((c) => ({
          id: c.id,
          mealId: c.mealId,
          menuItemId: c.menuItemId,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
        })),
      })),
    } as OrderDTO;
  }

  async create(dto: CreateOrderDTO): Promise<OrderDTO> {
    const customer = await prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new BadRequestException('Cliente não encontrado');

    if (dto.cycleId) {
      const cycle = await prisma.weeklyCycle.findUnique({ where: { id: dto.cycleId } });
      if (!cycle) throw new BadRequestException('Ciclo não encontrado');

      const confirmedCount = await prisma.order.count({
        where: { cycleId: dto.cycleId, status: { not: 'CANCELLED' } },
      });

      if (confirmedCount >= cycle.maxClients) {
        throw new BadRequestException('Ciclo lotado. Entre na lista de espera.');
      }
    }

    const dishIds: string[] = dto.items.map((i) => i.dishId);
    const dishes = (await prisma.dish.findMany({ where: { id: { in: dishIds } } })) as unknown as DishRow[];
    if (dishes.length !== dto.items.length) throw new BadRequestException('Um ou mais pratos não encontrados');

    let total = 0;
    for (const item of dto.items) {
      const dish = dishes.find((d: DishRow) => d.id === item.dishId);
      if (!dish) throw new BadRequestException(`Prato ${item.dishId} não encontrado`);
      total += dish.price * item.quantity;
    }

    const order = await prisma.order.create({
      data: {
        customerId: dto.customerId,
        cycleId: dto.cycleId,
        planType: dto.planType,
        mealType: dto.mealType ?? 'ALMOCO_JANTA',
        nutritionistPlanId: dto.nutritionistPlanId ?? null,
        sourcePdfUrl: dto.sourcePdfUrl ?? null,
        totalAmount: total,
        deliveryAddress: dto.deliveryAddress,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        notes: dto.notes,
        items: {
          create: dto.items.map((i) => ({
            dishId: i.dishId,
            quantity: i.quantity,
            unitPrice: dishes.find((d: DishRow) => d.id === i.dishId)!.price,
          })),
        },
      },
      include: {
        customer: { select: { name: true } },
        items: { include: { dish: { select: { name: true } } } },
      },
    });

    return this.findById(order.id);
  }

  // ── v2.1: Meal-based creation ──────────────────────

  async createMealBased(dto: CreateMealBasedOrderDTO): Promise<OrderDTO> {
    const customer = await prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new BadRequestException('Cliente não encontrado');

    if (dto.cycleId) {
      const cycle = await prisma.weeklyCycle.findUnique({ where: { id: dto.cycleId } });
      if (!cycle) throw new BadRequestException('Ciclo não encontrado');
      const confirmedCount = await prisma.order.count({
        where: { cycleId: dto.cycleId, status: { not: 'CANCELLED' } },
      });
      if (confirmedCount >= cycle.maxClients) {
        throw new BadRequestException('Ciclo lotado. Entre na lista de espera.');
      }
    }

    // Collect all menuItemIds and fetch technical sheets for pricing
    const allMenuIds = new Set<string>();
    const processedMeals: Array<{
      proteinId: string;
      carboId: string;
      fiberId: string;
      fatId: string | null;
      notes: string | null;
    }> = [];

    for (const tpl of dto.meals) {
      if (tpl.copyFromSlot) {
        const source = processedMeals[tpl.copyFromSlot - 1];
        if (!source) throw new BadRequestException(`Slot de origem ${tpl.copyFromSlot} inválido`);
        processedMeals.push({ ...source });
        allMenuIds.add(source.proteinId);
        allMenuIds.add(source.carboId);
        allMenuIds.add(source.fiberId);
        if (source.fatId) allMenuIds.add(source.fatId);
        continue;
      }
      const meal = { proteinId: tpl.proteinId, carboId: tpl.carboId, fiberId: tpl.fiberId, fatId: tpl.fatId ?? null, notes: tpl.notes ?? null };
      processedMeals.push(meal);
      allMenuIds.add(tpl.proteinId);
      allMenuIds.add(tpl.carboId);
      allMenuIds.add(tpl.fiberId);
      if (tpl.fatId) allMenuIds.add(tpl.fatId);
    }

    // Fetch all menu items with technical sheets for pricing
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: [...allMenuIds] } },
      include: { technicalSheet: true },
    });
    const priceMap = new Map<string, number>();
    for (const mi of menuItems) {
      priceMap.set(mi.id, mi.technicalSheet?.price ?? 0);
    }

    // Calculate total from technical sheet prices
    let total = 0;
    for (const meal of processedMeals) {
      total += priceMap.get(meal.proteinId) ?? 0;
      total += priceMap.get(meal.carboId) ?? 0;
      total += priceMap.get(meal.fiberId) ?? 0;
      if (meal.fatId) total += priceMap.get(meal.fatId) ?? 0;
    }

    const order = await prisma.order.create({
      data: {
        customerId: dto.customerId,
        cycleId: dto.cycleId,
        planType: dto.planType ?? 'SINGLE',
        mealType: dto.mealType ?? 'ALMOCO_JANTA',
        totalAmount: total,
        deliveryAddress: dto.deliveryAddress,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        notes: dto.notes,
        meals: {
          create: processedMeals.map((meal) => ({
            notes: meal.notes,
            components: {
              create: [
                { menuItemId: meal.proteinId, quantity: 1, unitPrice: priceMap.get(meal.proteinId) ?? 0 },
                { menuItemId: meal.carboId, quantity: 1, unitPrice: priceMap.get(meal.carboId) ?? 0 },
                { menuItemId: meal.fiberId, quantity: 1, unitPrice: priceMap.get(meal.fiberId) ?? 0 },
                ...(meal.fatId ? [{ menuItemId: meal.fatId, quantity: 1, unitPrice: priceMap.get(meal.fatId) ?? 0 }] : []),
              ],
            },
          })),
        },
      },
    });

    return this.findById(order.id);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDTO): Promise<OrderDTO> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pedido não encontrado');

    await prisma.order.update({ where: { id }, data: { status: dto.status, notes: dto.notes ?? existing.notes } });

    // ── v2.1: Stock deduction when marking as READY ──
    if (dto.status === 'DELIVERED') {
      await this.deductStock(id);
    }

    return this.findById(id);
  }

  private async deductStock(orderId: string): Promise<{ warnings: string[] }> {
    const warnings: string[] = [];

    // Get all meals with components for this order
    const meals = await prisma.meal.findMany({
      where: { orderId },
      include: { components: { include: { menuItem: { include: { technicalSheet: { include: { ingredients: true } } } } } } },
    });

    // Aggregate ingredient requirements from all technical sheets
    const ingredientNeeds = new Map<string, number>();
    for (const meal of meals) {
      for (const comp of meal.components) {
        const sheet = comp.menuItem?.technicalSheet;
        if (!sheet) continue;
        for (const ing of sheet.ingredients) {
          const current = ingredientNeeds.get(ing.ingredientId) ?? 0;
          ingredientNeeds.set(ing.ingredientId, current + ing.quantity * comp.quantity);
        }
      }
    }

    // Deduct from stock
    for (const [ingredientId, qty] of ingredientNeeds) {
      const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
      if (!ingredient) continue;

      const newStock = ingredient.stockQty - qty;
      if (newStock < 0) {
        warnings.push(`Estoque insuficiente de ${ingredient.name}: precisa de ${qty} ${ingredient.unit}, tem ${ingredient.stockQty}`);
      }

      await prisma.ingredient.update({
        where: { id: ingredientId },
        data: { stockQty: Math.max(0, newStock) },
      });
    }

    return { warnings };
  }

  async update(id: string, dto: Record<string, unknown>): Promise<OrderDTO> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pedido não encontrado');

    const data: Record<string, unknown> = {};
    if (dto.deliveryAddress) data.deliveryAddress = dto.deliveryAddress;
    if (dto.deliveryDate) data.deliveryDate = new Date(dto.deliveryDate as string);
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.planType) data.planType = dto.planType;
    if (dto.mealType) data.mealType = dto.mealType;

    await prisma.order.update({ where: { id }, data });
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pedido não encontrado');
    await prisma.order.delete({ where: { id } });
  }

  async updateItems(id: string, items: Array<{ dishId: string; quantity: number }>): Promise<OrderDTO> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pedido não encontrado');

    const dishIds = items.map((i) => i.dishId);
    const dishes = (await prisma.dish.findMany({ where: { id: { in: dishIds } } })) as unknown as DishRow[];
    if (dishes.length !== items.length) throw new BadRequestException('Um ou mais pratos não encontrados');

    let total = 0;
    for (const item of items) {
      const dish = dishes.find((d: DishRow) => d.id === item.dishId);
      if (!dish) throw new BadRequestException(`Prato ${item.dishId} não encontrado`);
      total += dish.price * item.quantity;
    }

    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.orderItem.createMany({
      data: items.map((i) => ({
        orderId: id,
        dishId: i.dishId,
        quantity: i.quantity,
        unitPrice: dishes.find((d: DishRow) => d.id === i.dishId)!.price,
      })),
    });
    await prisma.order.update({ where: { id }, data: { totalAmount: total } });

    return this.findById(id);
  }

  // ── v2.1: Previous order meals for reuse ─────────
  async getPreviousMeals(customerId: string, limit = 5): Promise<Array<{
    orderId: string; createdAt: string; mealCount: number;
    meals: Array<{ id: string; notes: string | null; components: Array<{ menuItemId: string; menuItemName: string; nutrientType: string; quantity: number; unitPrice: number }> }>;
  }>> {
    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        meals: {
          include: {
            components: {
              include: { menuItem: { select: { id: true, name: true, nutrientType: true } } },
            },
          },
        },
      },
    });

    return orders
      .filter((o) => (o.meals?.length ?? 0) > 0)
      .map((o) => ({
        orderId: o.id,
        createdAt: o.createdAt.toISOString(),
        mealCount: o.meals.length,
        meals: o.meals.map((m) => ({
          id: m.id,
          notes: m.notes,
          components: m.components.map((c) => ({
            menuItemId: c.menuItemId,
            menuItemName: c.menuItem.name,
            nutrientType: c.menuItem.nutrientType,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
          })),
        })),
      }));
  }
}
