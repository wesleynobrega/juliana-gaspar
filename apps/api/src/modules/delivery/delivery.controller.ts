import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DeliveryService } from './delivery.service';
import { createDeliveryZoneSchema, type CreateDeliveryZoneDTO } from '@juliana-gaspar/contracts';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get('zones')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  getZones() { return this.deliveryService.findAllZones(); }

  @Post('zones')
  @Roles('ADMIN')
  createZone(@Body(new ZodValidationPipe(createDeliveryZoneSchema)) dto: CreateDeliveryZoneDTO) { return this.deliveryService.createZone(dto); }

  @Put('zones/:id')
  @Roles('ADMIN')
  updateZone(@Param('id') id: string, @Body() dto: Partial<CreateDeliveryZoneDTO>) { return this.deliveryService.updateZone(id, dto); }

  @Delete('zones/:id')
  @Roles('ADMIN')
  deleteZone(@Param('id') id: string) { return this.deliveryService.deleteZone(id); }

  @Get('manifest')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  getManifest(@Query('zoneId') zoneId?: string, @Query('date') date?: string) { return this.deliveryService.getManifest(zoneId, date); }
}
