import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CustomersService } from './customers.service';
import {
  createCustomerSchema, updateCustomerSchema, createFavoriteMealSchema,
  type CreateCustomerDTO, type UpdateCustomerDTO, type CreateFavoriteMealDTO,
} from '@juliana-gaspar/contracts';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string, @Query('tag') tag?: string) {
    return this.customersService.findAll(+page, +limit, search, tag);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) { return this.customersService.findById(id); }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createCustomerSchema)) dto: CreateCustomerDTO) { return this.customersService.create(dto); }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateCustomerSchema)) dto: UpdateCustomerDTO) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  // ── v2.1: Favorites ──────────────────────────────

  @Get(':id/favorites')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  getFavorites(@Param('id') id: string) {
    return this.customersService.getFavorites(id);
  }

  @Post(':id/favorites')
  @Roles('ADMIN', 'OPERATOR')
  createFavorite(@Param('id') id: string, @Body(new ZodValidationPipe(createFavoriteMealSchema)) dto: CreateFavoriteMealDTO) {
    return this.customersService.createFavorite(id, dto);
  }

  @Delete(':id/favorites/:favId')
  @Roles('ADMIN')
  removeFavorite(@Param('id') id: string, @Param('favId') favId: string) {
    return this.customersService.removeFavorite(id, favId);
  }
}
