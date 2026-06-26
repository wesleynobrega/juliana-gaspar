import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { createPaymentSchema, registerPaymentSchema, type CreatePaymentDTO, type RegisterPaymentDTO } from '@juliana-gaspar/contracts';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query() query: Record<string, string>) {
    return this.paymentsService.findAll(+query.page || 1, +query.limit || 20, query.status, query.method);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createPaymentSchema)) dto: CreatePaymentDTO) { return this.paymentsService.create(dto); }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.paymentsService.update(id, dto);
  }

  @Patch(':id/register')
  @Roles('ADMIN', 'OPERATOR')
  register(@Param('id') id: string, @Body(new ZodValidationPipe(registerPaymentSchema)) dto: RegisterPaymentDTO) {
    return this.paymentsService.register(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }

  @Post(':id/refund')
  @Roles('ADMIN', 'OPERATOR')
  refund(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.paymentsService.refund(id, body.reason);
  }
}
