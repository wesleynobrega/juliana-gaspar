import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type {
  UploadPdfDTO,
  NutritionistPlanDTO,
} from '@juliana-gaspar/contracts';

// ── Mappers ────────────────────────────────────────────

type PrismaPlan =
  Awaited<ReturnType<typeof prisma.nutritionistPlan.findUnique>>;

function toPlanDTO(plan: NonNullable<PrismaPlan>): NutritionistPlanDTO {
  return {
    id: plan.id,
    customerId: plan.customerId,
    sourcePdfUrl: plan.sourcePdfUrl,
    parsedData: (plan.parsedData as Record<string, unknown>) ?? null,
    notes: plan.notes ?? null,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

// ── Service ────────────────────────────────────────────

@Injectable()
export class NutritionPdfService {
  async findAll(
    customerId?: string,
  ): Promise<{ data: NutritionistPlanDTO[]; total: number }> {
    const where = customerId ? { customerId } : {};
    const [data, total] = await Promise.all([
      prisma.nutritionistPlan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.nutritionistPlan.count({ where }),
    ]);
    return {
      data: data.map((p) => toPlanDTO(p as NonNullable<PrismaPlan>)),
      total,
    };
  }

  async findById(id: string): Promise<NutritionistPlanDTO> {
    const plan = await prisma.nutritionistPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plano nutricional não encontrado');
    return toPlanDTO(plan);
  }

  /** Placeholder: apenas registra a URL do PDF, sem chamada de IA */
  async upload(dto: UploadPdfDTO): Promise<NutritionistPlanDTO> {
    const customer = await prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException('Cliente não encontrado');

    const plan = await prisma.nutritionistPlan.create({
      data: {
        customerId: dto.customerId,
        sourcePdfUrl: dto.sourcePdfUrl,
        notes: dto.notes ?? null,
      },
    });
    return toPlanDTO(plan);
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.nutritionistPlan.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Plano nutricional não encontrado');
    await prisma.nutritionistPlan.delete({ where: { id } });
  }
}
