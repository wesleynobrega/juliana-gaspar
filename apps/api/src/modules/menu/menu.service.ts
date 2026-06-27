import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type {
  CreateMenuItemDTO,
  UpdateMenuItemDTO,
  MenuItemDTO,
  CreateTechnicalSheetDTO,
  UpdateTechnicalSheetDTO,
  TechnicalSheetDTO,
  CreateSpecialRequestDTO,
  UpdateSpecialRequestDTO,
  SpecialRequestDTO,
} from '@juliana-gaspar/contracts';

// ── Mappers ────────────────────────────────────────────

type PrismaMenuItem = Awaited<ReturnType<typeof prisma.menuItem.findUnique>>;

function toMenuItemDTO(item: NonNullable<PrismaMenuItem>): MenuItemDTO {
  return {
    ...item,
    description: item.description ?? null,
    photoUrl: item.photoUrl ?? null,
    allergens: item.allergens ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

type PrismaTechnicalSheet = Awaited<
  ReturnType<typeof prisma.technicalSheet.findUnique>
> & { ingredients?: Array<{ id: string; technicalSheetId: string; ingredientId: string; quantity: number; ingredient?: { name: string; unit: string } }> };

function toTechnicalSheetDTO(
  sheet: NonNullable<PrismaTechnicalSheet>,
): TechnicalSheetDTO {
  return {
    ...sheet,
    price: (sheet as Record<string, unknown>).price as number ?? 0,
    temperature: sheet.temperature ?? null,
    notes: sheet.notes ?? null,
    ingredients: (sheet.ingredients ?? []).map((i) => ({
      id: i.id,
      technicalSheetId: i.technicalSheetId,
      ingredientId: i.ingredientId,
      ingredientName: i.ingredient?.name,
      ingredientUnit: i.ingredient?.unit,
      quantity: i.quantity,
    })),
    createdAt: sheet.createdAt.toISOString(),
    updatedAt: sheet.updatedAt.toISOString(),
  };
}

type PrismaSpecialRequest =
  Awaited<ReturnType<typeof prisma.specialRequest.findUnique>>;

function toSpecialRequestDTO(
  req: NonNullable<PrismaSpecialRequest>,
): SpecialRequestDTO {
  return {
    ...req,
    customerId: req.customerId ?? null,
    nutrientType: (req.nutrientType as SpecialRequestDTO['nutrientType']) ?? null,
    createdAt: req.createdAt.toISOString(),
  };
}

// ── Service ────────────────────────────────────────────

@Injectable()
export class MenuService {
  // ── MenuItem CRUD ──────────────────────────────────

  async findAll(
    page = 1,
    limit = 20,
    nutrientType?: string,
  ): Promise<{
    data: MenuItemDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where = nutrientType ? { nutrientType: nutrientType as never } : {};
    const [data, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.menuItem.count({ where }),
    ]);
    return {
      data: data.map((d) => toMenuItemDTO(d as NonNullable<PrismaMenuItem>)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<MenuItemDTO> {
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item do cardápio não encontrado');
    return toMenuItemDTO(item);
  }

  async create(dto: CreateMenuItemDTO): Promise<MenuItemDTO> {
    const item = await prisma.menuItem.create({ data: dto });
    return toMenuItemDTO(item);
  }

  async update(id: string, dto: UpdateMenuItemDTO): Promise<MenuItemDTO> {
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Item do cardápio não encontrado');
    const item = await prisma.menuItem.update({ where: { id }, data: dto });
    return toMenuItemDTO(item);
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Item do cardápio não encontrado');
    await prisma.menuItem.delete({ where: { id } });
  }

  // ── TechnicalSheet ──────────────────────────────────

  async getTechnicalSheet(menuItemId: string): Promise<TechnicalSheetDTO> {
    const sheet = await prisma.technicalSheet.findUnique({
      where: { menuItemId },
      include: { ingredients: { include: { ingredient: { select: { name: true, unit: true } } } } },
    });
    if (!sheet) throw new NotFoundException('Ficha técnica não encontrada');
    return toTechnicalSheetDTO(sheet as unknown as PrismaTechnicalSheet);
  }

  async upsertTechnicalSheet(
    menuItemId: string,
    dto: CreateTechnicalSheetDTO | UpdateTechnicalSheetDTO,
  ): Promise<TechnicalSheetDTO> {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });
    if (!menuItem) throw new NotFoundException('Item do cardápio não encontrado');

    const { ingredients, ...sheetData } = dto as CreateTechnicalSheetDTO & { ingredients?: Array<{ ingredientId: string; quantity: number }> };

    const sheet = await prisma.technicalSheet.upsert({
      where: { menuItemId },
      update: { ...sheetData },
      create: { ...sheetData, menuItemId },
    });

    // Replace ingredients if provided
    if (ingredients !== undefined) {
      await prisma.technicalSheetIngredient.deleteMany({ where: { technicalSheetId: sheet.id } });
      if (ingredients.length > 0) {
        await prisma.technicalSheetIngredient.createMany({
          data: ingredients.map((i) => ({
            technicalSheetId: sheet.id,
            ingredientId: i.ingredientId,
            quantity: i.quantity,
          })),
        });
      }
    }

    const refreshed = await prisma.technicalSheet.findUnique({
      where: { id: sheet.id },
      include: { ingredients: { include: { ingredient: { select: { name: true, unit: true } } } } },
    });

    return toTechnicalSheetDTO(refreshed as unknown as PrismaTechnicalSheet);
  }

  // ── SpecialRequests ─────────────────────────────────

  async findAllSpecialRequests(
    page = 1,
    limit = 20,
  ): Promise<{
    data: SpecialRequestDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [data, total] = await Promise.all([
      prisma.specialRequest.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.specialRequest.count(),
    ]);
    return {
      data: data.map((r) =>
        toSpecialRequestDTO(r as NonNullable<PrismaSpecialRequest>),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createSpecialRequest(
    dto: CreateSpecialRequestDTO,
  ): Promise<SpecialRequestDTO> {
    const req = await prisma.specialRequest.create({ data: dto });
    return toSpecialRequestDTO(req);
  }

  async updateSpecialRequest(
    id: string,
    dto: UpdateSpecialRequestDTO,
  ): Promise<SpecialRequestDTO> {
    const existing = await prisma.specialRequest.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException('Pedido especial não encontrado');
    const req = await prisma.specialRequest.update({ where: { id }, data: dto });
    return toSpecialRequestDTO(req);
  }
}
