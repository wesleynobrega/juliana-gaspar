import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { PricingConfigDTO, UpdatePricingConfigDTO, MealPrepLocal } from '@juliana-gaspar/contracts';

// Chaves centralizadas — nunca hardcode o valor nos módulos.
const BASE_KEY: Record<MealPrepLocal, string> = {
  CASA_CLIENTE: 'mealprep_casa_cliente',
  COZINHA_CHEF: 'mealprep_cozinha_chef',
};
const TAXA_COMPRAS_KEY = 'taxa_compras';

@Injectable()
export class PricingService {
  async findAll(): Promise<PricingConfigDTO[]> {
    const configs = await prisma.pricingConfig.findMany({ orderBy: { key: 'asc' } });
    return configs.map((c) => ({ ...c, updatedAt: c.updatedAt.toISOString() }));
  }

  async update(key: string, dto: UpdatePricingConfigDTO): Promise<PricingConfigDTO> {
    const existing = await prisma.pricingConfig.findUnique({ where: { key } });
    if (!existing) throw new NotFoundException(`Configuração de preço não encontrada: ${key}`);
    const c = await prisma.pricingConfig.update({ where: { key }, data: dto });
    return { ...c, updatedAt: c.updatedAt.toISOString() };
  }

  async getValue(key: string): Promise<number> {
    const cfg = await prisma.pricingConfig.findUnique({ where: { key } });
    if (!cfg || !cfg.active) throw new NotFoundException(`Configuração de preço não encontrada: ${key}`);
    return cfg.value;
  }

  // total = base(local) + (taxa_compras se solicitado)
  async computeMealPrepTotal(location: MealPrepLocal, groceryService: boolean): Promise<number> {
    const base = await this.getValue(BASE_KEY[location]);
    const taxa = groceryService ? await this.getValue(TAXA_COMPRAS_KEY) : 0;
    return base + taxa;
  }
}
