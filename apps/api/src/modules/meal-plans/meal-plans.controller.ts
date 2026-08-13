import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MealPlansService } from './meal-plans.service';
import { createPlanoAlimentarSchema, updatePlanoAlimentarSchema, type CreatePlanoAlimentarDTO, type UpdatePlanoAlimentarDTO } from '@juliana-gaspar/contracts';

@Controller('meal-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MealPlansController {
  constructor(private mealPlansService: MealPlansService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('clienteId') clienteId?: string) {
    return this.mealPlansService.findAll(+page, +limit, clienteId);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) {
    return this.mealPlansService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createPlanoAlimentarSchema)) dto: CreatePlanoAlimentarDTO) {
    return this.mealPlansService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updatePlanoAlimentarSchema)) dto: UpdatePlanoAlimentarDTO) {
    return this.mealPlansService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.mealPlansService.remove(id);
  }
}
