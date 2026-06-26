import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreatePaymentDTO, RegisterPaymentDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class PaymentsService {
  async findAll(page = 1, limit = 20, status?: string, method?: string) {
    const where: { status?: string; method?: string } = {};
    if (status) where.status = status;
    if (method) where.method = method;
    const [data, total] = await Promise.all([
      prisma.payment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { order: { select: { id: true, customer: { select: { name: true } } } } } }),
      prisma.payment.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(dto: CreatePaymentDTO) {
    const order = await prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return prisma.payment.create({ data: dto });
  }

  async findById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: { select: { id: true, customer: { select: { name: true } }, totalAmount: true } } },
    });
    if (!payment) throw new NotFoundException('Pagamento não encontrado');
    return payment;
  }

  async register(id: string, dto: RegisterPaymentDTO) {
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Pagamento não encontrado');

    const updated = await prisma.payment.update({ where: { id }, data: { status: 'PAID', paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date() } });
    await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: 'PAID' } });
    return updated;
  }

  async update(id: string, dto: { method?: string; amount?: number; status?: string }) {
    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pagamento não encontrado');

    const data: { method?: string; amount?: number; status?: string } = {};
    if (dto.method) data.method = dto.method;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.status) data.status = dto.status;

    return prisma.payment.update({ where: { id }, data, include: { order: { select: { id: true, customer: { select: { name: true } }, totalAmount: true } } } });
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pagamento não encontrado');
    await prisma.payment.delete({ where: { id } });
  }

  async refund(id: string, reason?: string): Promise<Record<string, unknown>> {
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Pagamento não encontrado');

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: 'REFUNDED' },
    });

    // Update associated order payment status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'REFUNDED' },
    });

    return { ...updated, refundReason: reason, refundedAt: new Date().toISOString() };
  }
}
