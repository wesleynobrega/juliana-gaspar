import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CyclesService } from './cycles.service';
import { createCycleSchema, updateCycleSchema, type CreateCycleDTO, type UpdateCycleDTO } from '@juliana-gaspar/contracts';

@Controller('cycles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CyclesController {
  constructor(private cyclesService: CyclesService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) { return this.cyclesService.findAll(+page, +limit); }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) { return this.cyclesService.findById(id); }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createCycleSchema)) dto: CreateCycleDTO) { return this.cyclesService.create(dto); }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateCycleSchema)) dto: UpdateCycleDTO) {
    return this.cyclesService.update(id, dto);
  }
}
