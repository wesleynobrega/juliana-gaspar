import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateSubscriptionDTO, UpdateSubscriptionDTO, PauseSubscriptionDTO, SubscriptionDTO } from '@juliana-gaspar/contracts';

function toSubscriptionDTO(s: Awaited<ReturnType<typeof prisma.subscription.findUnique>>): SubscriptionDTO {
  if (!s) throw new NotFoundException('Assinatura não encontrada');
  const dto: SubscriptionDTO = {
    id: s.id,
    customerId: s.customerId,
    planType: s.planType as 'WEEKLY' | 'MONTHLY',
    status: s.status as SubscriptionDTO['status'],
    startDate: s.startDate.toISOString(),
    nextRenewal: s.nextRenewal.toISOString(),
    pausedUntil: s.pausedUntil?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
  };
  return dto;
}

@Injectable()
export class SubscriptionsService {
  async findAll(page = 1, limit = 20, status?: string, customerId?: string) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const [data, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, phone: true } } },
      }),
      prisma.subscription.count({ where }),
    ]);

    const mapped = data.map((s) => ({
      ...toSubscriptionDTO(s),
      customerName: s.customer.name,
      customerPhone: s.customer.phone,
    }));

    return { data: mapped, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const s = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: { select: { name: true, phone: true } } },
    });
    if (!s) throw new NotFoundException('Assinatura não encontrada');

    return {
      ...toSubscriptionDTO(s),
      customerName: s.customer.name,
      customerPhone: s.customer.phone,
    };
  }

  async create(dto: CreateSubscriptionDTO) {
    const customer = await prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Cliente não encontrado');

    const now = new Date();
    const nextRenewal = new Date(now);
    nextRenewal.setDate(nextRenewal.getDate() + (dto.planType === 'WEEKLY' ? 7 : 30));

    const s = await prisma.subscription.create({
      data: {
        customerId: dto.customerId,
        planType: dto.planType,
        status: 'ACTIVE',
        startDate: now,
        nextRenewal,
      },
      include: { customer: { select: { name: true, phone: true } } },
    });

    return {
      ...toSubscriptionDTO(s),
      customerName: s.customer.name,
      customerPhone: s.customer.phone,
    };
  }

  async update(id: string, dto: UpdateSubscriptionDTO) {
    const existing = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: { select: { name: true, phone: true } } },
    });
    if (!existing) throw new NotFoundException('Assinatura não encontrada');

    const s = await prisma.subscription.update({
      where: { id },
      data: dto as Record<string, unknown>,
      include: { customer: { select: { name: true, phone: true } } },
    });

    return {
      ...toSubscriptionDTO(s),
      customerName: s.customer.name,
      customerPhone: s.customer.phone,
    };
  }

  async pause(id: string, dto: PauseSubscriptionDTO) {
    const existing = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: { select: { name: true, phone: true } } },
    });
    if (!existing) throw new NotFoundException('Assinatura não encontrada');
    if (existing.status === 'CANCELLED') throw new BadRequestException('Não é possível pausar uma assinatura cancelada');

    const s = await prisma.subscription.update({
      where: { id },
      data: { status: 'PAUSED', pausedUntil: new Date(dto.pausedUntil) },
      include: { customer: { select: { name: true, phone: true } } },
    });

    return {
      ...toSubscriptionDTO(s),
      customerName: s.customer.name,
      customerPhone: s.customer.phone,
    };
  }

  async resume(id: string) {
    const existing = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: { select: { name: true, phone: true } } },
    });
    if (!existing) throw new NotFoundException('Assinatura não encontrada');
    if (existing.status !== 'PAUSED') throw new BadRequestException('Somente assinaturas pausadas podem ser retomadas');

    const nextRenewal = new Date();
    nextRenewal.setDate(nextRenewal.getDate() + (existing.planType === 'WEEKLY' ? 7 : 30));

    const s = await prisma.subscription.update({
      where: { id },
      data: { status: 'ACTIVE', pausedUntil: null, nextRenewal },
      include: { customer: { select: { name: true, phone: true } } },
    });

    return {
      ...toSubscriptionDTO(s),
      customerName: s.customer.name,
      customerPhone: s.customer.phone,
    };
  }

  async cancel(id: string) {
    const existing = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: { select: { name: true, phone: true } } },
    });
    if (!existing) throw new NotFoundException('Assinatura não encontrada');

    const s = await prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { customer: { select: { name: true, phone: true } } },
    });

    return {
      ...toSubscriptionDTO(s),
      customerName: s.customer.name,
      customerPhone: s.customer.phone,
    };
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.subscription.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Assinatura não encontrada');
    await prisma.subscription.delete({ where: { id } });
  }
}
