import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateOrderDTO, UpdateOrderStatusDTO, OrderDTO, OrderItemDTO } from '@juliana-gaspar/contracts';

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
    const where: {
      status?: string;
      paymentStatus?: string;
      planType?: string;
      customerId?: string;
      createdAt?: { gte?: Date; lte?: Date };
      customer?: { name: { contains: string; mode: 'insensitive' } };
    } = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (planType) where.planType = planType;
    if (customerId) where.customerId = customerId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
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
        },
      }),
      prisma.order.count({ where }),
    ]);

    const typedData = data as unknown as OrderWithIncludes[];

    const mapped: OrderDTO[] = typedData.map((o: OrderWithIncludes) => ({
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
    }));

    return { data: mapped, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<OrderDTO> {
    const o = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, phone: true } },
        items: { include: { dish: { select: { name: true } } } },
      },
    }) as unknown as OrderWithIncludes | null;

    if (!o) throw new NotFoundException('Pedido não encontrado');

    return {
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
    };
  }

  async create(dto: CreateOrderDTO): Promise<OrderDTO> {
    const customer = await prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new BadRequestException('Cliente não encontrado');

    // ── v2.0: capacity check ──────────────────────────
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
      const dish: DishRow | undefined = dishes.find((d: DishRow) => d.id === item.dishId);
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

  async updateStatus(id: string, dto: UpdateOrderStatusDTO): Promise<OrderDTO> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pedido não encontrado');
    await prisma.order.update({ where: { id }, data: { status: dto.status, notes: dto.notes ?? existing.notes } });
    return this.findById(id);
  }

  async update(id: string, dto: { deliveryAddress?: string; deliveryDate?: string; notes?: string | null; planType?: string; mealType?: string }): Promise<OrderDTO> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pedido não encontrado');

    const data: Record<string, unknown> = {};
    if (dto.deliveryAddress) data.deliveryAddress = dto.deliveryAddress;
    if (dto.deliveryDate) data.deliveryDate = new Date(dto.deliveryDate);
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
}
