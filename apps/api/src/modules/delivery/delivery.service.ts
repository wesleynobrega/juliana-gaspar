import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateDeliveryZoneDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class DeliveryService {
  async findAllZones() { return prisma.deliveryZone.findMany(); }

  async createZone(dto: CreateDeliveryZoneDTO) { return prisma.deliveryZone.create({ data: dto }); }

  async updateZone(id: string, dto: Partial<CreateDeliveryZoneDTO>) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Zona de entrega não encontrada');
    return prisma.deliveryZone.update({ where: { id }, data: dto });
  }

  async deleteZone(id: string) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Zona de entrega não encontrada');
    return prisma.deliveryZone.delete({ where: { id } });
  }

  async getManifest(zoneId?: string, date?: string): Promise<Record<string, unknown>> {
    const where: { status: { in: string[] }; deliveryDate?: Date; deliveryZoneId?: string } = { status: { in: ['CONFIRMED', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY'] } };
    if (date) where.deliveryDate = new Date(date);
    if (zoneId) where.deliveryZoneId = zoneId;
    const orders = await prisma.order.findMany({
      where, orderBy: { deliveryAddress: 'asc' },
      include: { customer: { select: { name: true, phone: true, address: true } }, items: { include: { dish: { select: { name: true, allergens: true } } } } },
    });
    return { date: date ?? new Date().toISOString().split('T')[0], orderCount: orders.length, orders };
  }
}
