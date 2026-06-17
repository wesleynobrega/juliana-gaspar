import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
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

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createPaymentSchema)) dto: CreatePaymentDTO) { return this.paymentsService.create(dto); }

  @Patch(':id/register')
  @Roles('ADMIN', 'OPERATOR')
  register(@Param('id') id: string, @Body(new ZodValidationPipe(registerPaymentSchema)) dto: RegisterPaymentDTO) {
    return this.paymentsService.register(id, dto);
  }
}
