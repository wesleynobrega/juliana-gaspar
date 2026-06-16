import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateOrderDTO, UpdateOrderStatusDTO, OrderDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class OrdersService {
  async findAll(params: { page: number; limit: number; status?: string; paymentStatus?: string; planType?: string; customerId?: string; dateFrom?: string; dateTo?: string; search?: string }) {
    const { page, limit, status, paymentStatus, planType, customerId, dateFrom, dateTo, search } = params;
    const where: any = {};
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
      where.customer = { name: { contains: search, mode: 'insensitive' } };
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, phone: true } }, items: { include: { dish: { select: { name: true } } } } },
      }),
      prisma.order.count({ where }),
    ]);

    const mapped: OrderDTO[] = data.map(o => ({
      id: o.id, customerId: o.customerId, customerName: o.customer.name,
      cycleId: o.cycleId, planType: o.planType as any, status: o.status as any,
      paymentStatus: o.paymentStatus as any, totalAmount: o.totalAmount,
      deliveryAddress: o.deliveryAddress, deliveryDate: o.deliveryDate?.toISOString() ?? null,
      notes: o.notes, createdAt: o.createdAt.toISOString(),
      items: o.items.map(i => ({ id: i.id, dishId: i.dishId, dishName: i.dish.name, quantity: i.quantity, unitPrice: i.unitPrice })),
    }));

    return { data: mapped, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<OrderDTO> {
    const o = await prisma.order.findUnique({
      where: { id },
      include: { customer: { select: { name: true, phone: true } }, items: { include: { dish: { select: { name: true } } } } },
    });
    if (!o) throw new NotFoundException('Pedido não encontrado');
    return {
      id: o.id, customerId: o.customerId, customerName: o.customer.name,
      cycleId: o.cycleId, planType: o.planType as any, status: o.status as any,
      paymentStatus: o.paymentStatus as any, totalAmount: o.totalAmount,
      deliveryAddress: o.deliveryAddress, deliveryDate: o.deliveryDate?.toISOString() ?? null,
      notes: o.notes, createdAt: o.createdAt.toISOString(),
      items: o.items.map(i => ({ id: i.id, dishId: i.dishId, dishName: i.dish.name, quantity: i.quantity, unitPrice: i.unitPrice })),
    };
  }

  async create(dto: CreateOrderDTO): Promise<OrderDTO> {
    const customer = await prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new BadRequestException('Cliente não encontrado');

    const dishes = await prisma.dish.findMany({ where: { id: { in: dto.items.map(i => i.dishId) } } });
    if (dishes.length !== dto.items.length) throw new BadRequestException('Um ou mais pratos não encontrados');

    let total = 0;
    for (const item of dto.items) {
      const dish = dishes.find(d => d.id === item.dishId);
      if (!dish) throw new BadRequestException(`Prato ${item.dishId} não encontrado`);
      total += dish.price * item.quantity;
    }

    const order = await prisma.order.create({
      data: {
        customerId: dto.customerId, cycleId: dto.cycleId, planType: dto.planType,
        totalAmount: total, deliveryAddress: dto.deliveryAddress,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        notes: dto.notes,
        items: { create: dto.items.map(i => ({ dishId: i.dishId, quantity: i.quantity, unitPrice: dishes.find(d => d.id === i.dishId)!.price })) },
      },
      include: { customer: { select: { name: true } }, items: { include: { dish: { select: { name: true } } } } },
    });

    return this.findById(order.id);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDTO): Promise<OrderDTO> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pedido não encontrado');
    await prisma.order.update({ where: { id }, data: { status: dto.status, notes: dto.notes ?? existing.notes } });
    return this.findById(id);
  }
}
