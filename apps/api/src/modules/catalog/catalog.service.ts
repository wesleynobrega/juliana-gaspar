import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateDishDTO, UpdateDishDTO, DishDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class CatalogService {
  async findAll(page = 1, limit = 20, search?: string): Promise<{ data: DishDTO[]; total: number; page: number; limit: number; totalPages: number }> {
    const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { description: { contains: search, mode: 'insensitive' as const } }] } : {};
    const [data, total] = await Promise.all([
      prisma.dish.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.dish.count({ where }),
    ]);
    return { data: data.map(d => ({ ...d, createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString() })), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<DishDTO> {
    const dish = await prisma.dish.findUnique({ where: { id } });
    if (!dish) throw new NotFoundException('Prato não encontrado');
    return { ...dish, createdAt: dish.createdAt.toISOString(), updatedAt: dish.updatedAt.toISOString() };
  }

  async create(dto: CreateDishDTO): Promise<DishDTO> {
    const dish = await prisma.dish.create({ data: dto });
    return { ...dish, createdAt: dish.createdAt.toISOString(), updatedAt: dish.updatedAt.toISOString() };
  }

  async update(id: string, dto: UpdateDishDTO): Promise<DishDTO> {
    const existing = await prisma.dish.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Prato não encontrado');
    const dish = await prisma.dish.update({ where: { id }, data: dto });
    return { ...dish, createdAt: dish.createdAt.toISOString(), updatedAt: dish.updatedAt.toISOString() };
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.dish.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Prato não encontrado');
    await prisma.dish.delete({ where: { id } });
  }

  async duplicate(id: string): Promise<DishDTO> {
    const original = await prisma.dish.findUnique({ where: { id } });
    if (!original) throw new NotFoundException('Prato não encontrado');
    const dish = await prisma.dish.create({
      data: { name: `${original.name} (cópia)`, description: original.description, photoUrl: original.photoUrl, ingredients: original.ingredients, allergens: original.allergens, price: original.price, available: original.available },
    });
    return { ...dish, createdAt: dish.createdAt.toISOString(), updatedAt: dish.updatedAt.toISOString() };
  }
}
