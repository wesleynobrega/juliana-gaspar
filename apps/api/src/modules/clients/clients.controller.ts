import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClientsService } from './clients.service';
import { createClienteSchema, updateClienteSchema, type CreateClienteDTO, type UpdateClienteDTO } from '@juliana-gaspar/contracts';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string) {
    return this.clientsService.findAll(+page, +limit, search);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createClienteSchema)) dto: CreateClienteDTO) {
    return this.clientsService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateClienteSchema)) dto: UpdateClienteDTO) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
