import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MealsService } from './meals.service';
import {
  createMealSchema,
  updateMealSchema,
  type CreateMealDTO,
  type UpdateMealDTO,
} from '@juliana-gaspar/contracts';

@Controller('orders/:orderId/meals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MealsController {
  constructor(private mealsService: MealsService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Param('orderId') orderId: string) {
    return this.mealsService.findAll(orderId);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('orderId') orderId: string, @Param('id') id: string) {
    return this.mealsService.findById(orderId, id);
  }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(
    @Param('orderId') orderId: string,
    @Body(new ZodValidationPipe(createMealSchema)) dto: CreateMealDTO,
  ) {
    return this.mealsService.create(orderId, dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(
    @Param('orderId') orderId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMealSchema)) dto: UpdateMealDTO,
  ) {
    return this.mealsService.update(orderId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('orderId') orderId: string, @Param('id') id: string) {
    return this.mealsService.remove(orderId, id);
  }
}
