import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreatePlanoAlimentarDTO, UpdatePlanoAlimentarDTO, PlanoAlimentarDTO } from '@juliana-gaspar/contracts';

function toDTO(p: Record<string, unknown> & { cliente?: { name: string } | null; createdAt: Date; updatedAt: Date }): PlanoAlimentarDTO {
  return {
    ...p,
    clienteName: p.cliente?.name ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  } as PlanoAlimentarDTO;
}

@Injectable()
export class MealPlansService {
  async findAll(page = 1, limit = 20, clienteId?: string) {
    const where = clienteId ? { clienteId } : {};
    const [data, total] = await Promise.all([
      prisma.planoAlimentar.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { cliente: { select: { name: true } } },
      }),
      prisma.planoAlimentar.count({ where }),
    ]);
    return { data: data.map(toDTO), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<PlanoAlimentarDTO> {
    const p = await prisma.planoAlimentar.findUnique({
      where: { id },
      include: { cliente: { select: { name: true } } },
    });
    if (!p) throw new NotFoundException('Plano alimentar não encontrado');
    return toDTO(p);
  }

  async create(dto: CreatePlanoAlimentarDTO): Promise<PlanoAlimentarDTO> {
    const cliente = await prisma.cliente.findUnique({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    const p = await prisma.planoAlimentar.create({
      data: dto,
      include: { cliente: { select: { name: true } } },
    });
    return toDTO(p);
  }

  async update(id: string, dto: UpdatePlanoAlimentarDTO): Promise<PlanoAlimentarDTO> {
    const existing = await prisma.planoAlimentar.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Plano alimentar não encontrado');
    if (dto.clienteId) {
      const cliente = await prisma.cliente.findUnique({ where: { id: dto.clienteId } });
      if (!cliente) throw new NotFoundException('Cliente não encontrado');
    }
    const p = await prisma.planoAlimentar.update({
      where: { id },
      data: dto,
      include: { cliente: { select: { name: true } } },
    });
    return toDTO(p);
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.planoAlimentar.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Plano alimentar não encontrado');
    await prisma.planoAlimentar.delete({ where: { id } });
  }
}
