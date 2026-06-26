import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { NutritionPdfService } from './nutrition-pdf.service';
import {
  uploadPdfSchema,
  type UploadPdfDTO,
} from '@juliana-gaspar/contracts';

@Controller('nutrition-pdf')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NutritionPdfController {
  constructor(private nutritionPdfService: NutritionPdfService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('customerId') customerId?: string) {
    return this.nutritionPdfService.findAll(customerId);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) {
    return this.nutritionPdfService.findById(id);
  }

  @Post('upload')
  @Roles('ADMIN', 'OPERATOR')
  upload(
    @Body(new ZodValidationPipe(uploadPdfSchema)) dto: UploadPdfDTO,
  ) {
    return this.nutritionPdfService.upload(dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.nutritionPdfService.remove(id);
  }
}
