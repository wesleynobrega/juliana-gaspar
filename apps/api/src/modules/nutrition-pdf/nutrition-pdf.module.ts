import { Module } from '@nestjs/common';
import { NutritionPdfController } from './nutrition-pdf.controller';
import { NutritionPdfService } from './nutrition-pdf.service';

@Module({
  controllers: [NutritionPdfController],
  providers: [NutritionPdfService],
  exports: [NutritionPdfService],
})
export class NutritionPdfModule {}
