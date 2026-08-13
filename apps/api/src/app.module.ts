import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { MenuModule } from './modules/menu/menu.module';
import { MealPlansModule } from './modules/meal-plans/meal-plans.module';
import { MealPrepSessionsModule } from './modules/meal-prep-sessions/meal-prep-sessions.module';
import { PricingConfigModule } from './modules/pricing-config/pricing-config.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule,
    MenuModule,
    MealPlansModule,
    MealPrepSessionsModule,
    PricingConfigModule,
    HealthModule,
  ],
})
export class AppModule {}
