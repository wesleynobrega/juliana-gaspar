import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateClienteDTO, UpdateClienteDTO, ClienteDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class ClientsService {
  async findAll(page = 1, limit = 20, search?: string) {
    const where: Record<string, unknown> = {};
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }];
    const [data, total] = await Promise.all([
      prisma.cliente.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.cliente.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<ClienteDTO> {
    const c = await prisma.cliente.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Cliente não encontrado');
    return { ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() };
  }

  async create(dto: CreateClienteDTO): Promise<ClienteDTO> {
    const c = await prisma.cliente.create({ data: { ...dto, tags: [] } });
    return { ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() };
  }

  async update(id: string, dto: UpdateClienteDTO): Promise<ClienteDTO> {
    const existing = await prisma.cliente.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cliente não encontrado');
    const c = await prisma.cliente.update({ where: { id }, data: dto });
    return { ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() };
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.cliente.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cliente não encontrado');
    await prisma.cliente.delete({ where: { id } });
  }
}
