import { Module } from '@nestjs/common';
import { MealPrepSessionsController } from './meal-prep-sessions.controller';
import { MealPrepSessionsService } from './meal-prep-sessions.service';
import { PricingConfigModule } from '../pricing-config/pricing-config.module';

@Module({
  controllers: [MealPrepSessionsController],
  providers: [MealPrepSessionsService],
  imports: [PricingConfigModule],
})
export class MealPrepSessionsModule {}
