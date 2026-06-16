import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CyclesModule } from './modules/cycles/cycles.module';
import { CustomersModule } from './modules/customers/customers.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveryModule } from './modules/delivery/delivery.module';

@Module({
  imports: [AuthModule, CatalogModule, OrdersModule, CyclesModule, CustomersModule, PaymentsModule, DeliveryModule],
})
export class AppModule {}
