import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SubscriptionsService } from './subscriptions.service';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  pauseSubscriptionSchema,
  type CreateSubscriptionDTO,
  type UpdateSubscriptionDTO,
  type PauseSubscriptionDTO,
} from '@juliana-gaspar/contracts';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('status') status?: string, @Query('customerId') customerId?: string) {
    return this.subscriptionsService.findAll(+page, +limit, status, customerId);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) {
    return this.subscriptionsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createSubscriptionSchema)) dto: CreateSubscriptionDTO) {
    return this.subscriptionsService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateSubscriptionSchema)) dto: UpdateSubscriptionDTO) {
    return this.subscriptionsService.update(id, dto);
  }

  @Patch(':id/pause')
  @Roles('ADMIN', 'OPERATOR')
  pause(@Param('id') id: string, @Body(new ZodValidationPipe(pauseSubscriptionSchema)) dto: PauseSubscriptionDTO) {
    return this.subscriptionsService.pause(id, dto);
  }

  @Patch(':id/resume')
  @Roles('ADMIN', 'OPERATOR')
  resume(@Param('id') id: string) {
    return this.subscriptionsService.resume(id);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN', 'OPERATOR')
  cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
