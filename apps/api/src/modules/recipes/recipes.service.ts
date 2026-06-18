import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateRecipeItemDTO, UpdateRecipeItemDTO, RecipeItemDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class RecipesService {
  async findAll(page = 1, limit = 20, dishId?: string) {
    const where: Record<string, unknown> = {};
    if (dishId) where.dishId = dishId;

    const [data, total] = await Promise.all([
      prisma.recipeItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dishId: 'asc' },
        include: {
          ingredient: { select: { name: true, unit: true } },
          dish: { select: { name: true } },
        },
      }),
      prisma.recipeItem.count({ where }),
    ]);

    const mapped: RecipeItemDTO[] = data.map((item) => ({
      id: item.id,
      dishId: item.dishId,
      ingredientId: item.ingredientId,
      ingredientName: item.ingredient.name,
      quantity: item.quantity,
      unit: item.ingredient.unit,
    }));

    return { data: mapped, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<RecipeItemDTO> {
    const item = await prisma.recipeItem.findUnique({
      where: { id },
      include: {
        ingredient: { select: { name: true, unit: true } },
        dish: { select: { name: true } },
      },
    });
    if (!item) throw new NotFoundException('Item de receita não encontrado');

    return {
      id: item.id,
      dishId: item.dishId,
      ingredientId: item.ingredientId,
      ingredientName: item.ingredient.name,
      quantity: item.quantity,
      unit: item.ingredient.unit,
    };
  }

  async create(dto: CreateRecipeItemDTO): Promise<RecipeItemDTO> {
    const [dish, ingredient] = await Promise.all([
      prisma.dish.findUnique({ where: { id: dto.dishId } }),
      prisma.ingredient.findUnique({ where: { id: dto.ingredientId } }),
    ]);

    if (!dish) throw new NotFoundException('Prato não encontrado');
    if (!ingredient) throw new NotFoundException('Ingrediente não encontrado');

    const item = await prisma.recipeItem.create({ data: dto });

    return {
      id: item.id,
      dishId: item.dishId,
      ingredientId: item.ingredientId,
      ingredientName: ingredient.name,
      quantity: item.quantity,
      unit: ingredient.unit,
    };
  }

  async update(id: string, dto: UpdateRecipeItemDTO): Promise<RecipeItemDTO> {
    const existing = await prisma.recipeItem.findUnique({ where: { id }, include: { ingredient: { select: { name: true, unit: true } } } });
    if (!existing) throw new NotFoundException('Item de receita não encontrado');

    const item = await prisma.recipeItem.update({ where: { id }, data: dto as Record<string, unknown>, include: { ingredient: { select: { name: true, unit: true } } } });

    return {
      id: item.id,
      dishId: item.dishId,
      ingredientId: item.ingredientId,
      ingredientName: item.ingredient.name,
      quantity: item.quantity,
      unit: item.ingredient.unit,
    };
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.recipeItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Item de receita não encontrado');
    await prisma.recipeItem.delete({ where: { id } });
  }
}
