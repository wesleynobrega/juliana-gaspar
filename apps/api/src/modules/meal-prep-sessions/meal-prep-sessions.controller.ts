import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MealPrepSessionsService } from './meal-prep-sessions.service';
import { createMealPrepSessionSchema, updateMealPrepSessionSchema, type CreateMealPrepSessionDTO, type UpdateMealPrepSessionDTO } from '@juliana-gaspar/contracts';

@Controller('meal-prep-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MealPrepSessionsController {
  constructor(private mealPrepSessionsService: MealPrepSessionsService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('clienteId') clienteId?: string) {
    return this.mealPrepSessionsService.findAll(+page, +limit, clienteId);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) {
    return this.mealPrepSessionsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createMealPrepSessionSchema)) dto: CreateMealPrepSessionDTO) {
    return this.mealPrepSessionsService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateMealPrepSessionSchema)) dto: UpdateMealPrepSessionDTO) {
    return this.mealPrepSessionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.mealPrepSessionsService.remove(id);
  }
}
