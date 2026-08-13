import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PricingService } from './pricing.service';
import { updatePricingConfigSchema, type UpdatePricingConfigDTO } from '@juliana-gaspar/contracts';

@Controller('pricing-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PricingConfigController {
  constructor(private pricingService: PricingService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll() {
    return this.pricingService.findAll();
  }

  @Put(':key')
  @Roles('ADMIN')
  update(@Param('key') key: string, @Body(new ZodValidationPipe(updatePricingConfigSchema)) dto: UpdatePricingConfigDTO) {
    return this.pricingService.update(key, dto);
  }
}
