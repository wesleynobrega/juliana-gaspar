import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CustomersService } from './customers.service';
import { createCustomerSchema, updateCustomerSchema, type CreateCustomerDTO, type UpdateCustomerDTO } from '@juliana-gaspar/contracts';

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
}
