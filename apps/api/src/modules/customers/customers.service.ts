import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateCustomerDTO, UpdateCustomerDTO, CustomerDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class CustomersService {
  async findAll(page = 1, limit = 20, search?: string, tag?: string) {
    const where: Record<string, unknown> = {};
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }];
    if (tag) where.tags = { has: tag };
    const [data, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.customer.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<CustomerDTO> {
    const c = await prisma.customer.findUnique({ where: { id }, include: { orders: { select: { id: true, totalAmount: true, status: true, createdAt: true } } } });
    if (!c) throw new NotFoundException('Cliente não encontrado');
    return { ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(), tags: c.tags as CustomerDTO['tags'] };
  }

  async create(dto: CreateCustomerDTO): Promise<CustomerDTO> {
    const c = await prisma.customer.create({ data: { ...dto, tags: [] } });
    return { ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(), tags: c.tags as CustomerDTO['tags'] };
  }

  async update(id: string, dto: UpdateCustomerDTO): Promise<CustomerDTO> {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cliente não encontrado');
    const c = await prisma.customer.update({ where: { id }, data: dto as Record<string, unknown> });
    return { ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(), tags: c.tags as CustomerDTO['tags'] };
  }
}
