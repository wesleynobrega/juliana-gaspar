import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateIngredientDTO, UpdateIngredientDTO, IngredientDTO, PurchaseSuggestionDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class IngredientsService {
  async findAll(page = 1, limit = 20, search?: string) {
    const where: Record<string, unknown> = {};
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

  // ── v2.1: Purchase suggestion ─────────────────────

  async getPurchaseSuggestion(): Promise<PurchaseSuggestionDTO> {
    // Get all CONFIRMED orders (not yet delivered/cancelled)
    const confirmedOrders = await prisma.order.findMany({
      where: { status: 'CONFIRMED' },
      include: {
        meals: {
          include: {
            components: {
              include: {
                menuItem: {
                  include: {
                    technicalSheet: {
                      include: { ingredients: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Aggregate ingredient requirements
    const requirements = new Map<string, { ingredientName: string; unit: string; requiredQty: number }>();

    for (const order of confirmedOrders) {
      for (const meal of order.meals) {
        for (const comp of meal.components) {
          const sheet = comp.menuItem?.technicalSheet;
          if (!sheet) continue;
          for (const ing of sheet.ingredients) {
            const existing = requirements.get(ing.ingredientId);
            if (existing) {
              existing.requiredQty += ing.quantity * comp.quantity;
            } else {
              // Fetch ingredient name/unit lazily
              requirements.set(ing.ingredientId, {
                ingredientName: '',
                unit: '',
                requiredQty: ing.quantity * comp.quantity,
              });
            }
          }
        }
      }
    }

    // Fetch ingredient details
    const ingredientIds = [...requirements.keys()];
    const ingredients = await prisma.ingredient.findMany({
      where: { id: { in: ingredientIds } },
    });

    const items = ingredients.map((ing) => {
      const req = requirements.get(ing.id)!;
      return {
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
        currentStock: ing.stockQty,
        requiredQty: req.requiredQty,
        suggestedPurchase: Math.max(0, req.requiredQty - ing.stockQty),
      };
    });

    return {
      confirmedOrders: confirmedOrders.length,
      items,
    };
  }
}
