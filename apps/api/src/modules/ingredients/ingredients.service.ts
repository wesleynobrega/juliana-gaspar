import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateIngredientDTO, UpdateIngredientDTO, IngredientDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class IngredientsService {
  async findAll(page = 1, limit = 20, search?: string) {
    const where: { name?: { contains: string; mode: 'insensitive' } } = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.ingredient.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' } }),
      prisma.ingredient.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<IngredientDTO> {
    const ingredient = await prisma.ingredient.findUnique({ where: { id } });
    if (!ingredient) throw new NotFoundException('Ingrediente não encontrado');
    return { ...ingredient, createdAt: ingredient.createdAt.toISOString(), updatedAt: ingredient.updatedAt.toISOString() };
  }

  async create(dto: CreateIngredientDTO): Promise<IngredientDTO> {
    const ingredient = await prisma.ingredient.create({ data: dto });
    return { ...ingredient, createdAt: ingredient.createdAt.toISOString(), updatedAt: ingredient.updatedAt.toISOString() };
  }

  async update(id: string, dto: UpdateIngredientDTO): Promise<IngredientDTO> {
    const existing = await prisma.ingredient.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ingrediente não encontrado');
    const ingredient = await prisma.ingredient.update({ where: { id }, data: dto });
    return { ...ingredient, createdAt: ingredient.createdAt.toISOString(), updatedAt: ingredient.updatedAt.toISOString() };
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.ingredient.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ingrediente não encontrado');
    await prisma.ingredient.delete({ where: { id } });
  }
}
