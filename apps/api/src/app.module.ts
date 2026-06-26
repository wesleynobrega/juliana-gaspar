import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CyclesModule } from './modules/cycles/cycles.module';
import { CustomersModule } from './modules/customers/customers.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { MenuModule } from './modules/menu/menu.module';
import { CapacityModule } from './modules/capacity/capacity.module';
import { MealsModule } from './modules/meals/meals.module';
import { NutritionPdfModule } from './modules/nutrition-pdf/nutrition-pdf.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AuthModule,
    CatalogModule,
    OrdersModule,
    CyclesModule,
    CustomersModule,
    PaymentsModule,
    DeliveryModule,
    IngredientsModule,
    MenuModule,
    CapacityModule,
    MealsModule,
    NutritionPdfModule,
    DashboardModule,
    HealthModule,
  ],
})
export class AppModule {}
