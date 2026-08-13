import { Module } from '@nestjs/common';
import { PricingConfigController } from './pricing-config.controller';
import { PricingService } from './pricing.service';

@Module({
  controllers: [PricingConfigController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingConfigModule {}
