import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CatalogService } from './catalog.service';
import { createDishSchema, updateDishSchema, type CreateDishDTO, type UpdateDishDTO } from '@juliana-gaspar/contracts';

@Controller('dishes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string) {
    return this.catalogService.findAll(+page, +limit, search);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) {
    return this.catalogService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createDishSchema)) dto: CreateDishDTO) {
    return this.catalogService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateDishSchema)) dto: UpdateDishDTO) {
    return this.catalogService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }

  @Post(':id/duplicate')
  @Roles('ADMIN', 'OPERATOR')
  duplicate(@Param('id') id: string) {
    return this.catalogService.duplicate(id);
  }
}
