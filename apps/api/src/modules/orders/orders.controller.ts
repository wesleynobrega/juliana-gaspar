import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import {
  createOrderSchema, createMealBasedOrderSchema, updateOrderStatusSchema,
  type CreateOrderDTO, type CreateMealBasedOrderDTO, type UpdateOrderStatusDTO,
} from '@juliana-gaspar/contracts';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query() query: Record<string, string>) {
    return this.ordersService.findAll({
      page: +query.page || 1, limit: +query.limit || 20,
      status: query.status, paymentStatus: query.paymentStatus, planType: query.planType,
      customerId: query.customerId, dateFrom: query.dateFrom, dateTo: query.dateTo, search: query.search,
    });
  }

  @Get('previous-meals/:customerId')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  getPreviousMeals(@Param('customerId') customerId: string) {
    return this.ordersService.getPreviousMeals(customerId);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) { return this.ordersService.findById(id); }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrderDTO) {
    return this.ordersService.create(dto);
  }

  @Post('meal-based')
  @Roles('ADMIN', 'OPERATOR')
  createMealBased(@Body(new ZodValidationPipe(createMealBasedOrderSchema)) dto: CreateMealBasedOrderDTO) {
    return this.ordersService.createMealBased(dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'OPERATOR')
  updateStatus(@Param('id') id: string, @Body(new ZodValidationPipe(updateOrderStatusSchema)) dto: UpdateOrderStatusDTO) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Put(':id/items')
  @Roles('ADMIN', 'OPERATOR')
  updateItems(@Param('id') id: string, @Body() dto: { items: Array<{ dishId: string; quantity: number }> }) {
    return this.ordersService.updateItems(id, dto.items);
  }
}
