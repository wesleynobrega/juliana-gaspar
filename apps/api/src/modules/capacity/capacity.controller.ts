import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CapacityService } from './capacity.service';
import {
  createWaitlistEntrySchema,
  type CreateWaitlistEntryDTO,
} from '@juliana-gaspar/contracts';

@Controller('capacity')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CapacityController {
  constructor(private capacityService: CapacityService) {}

  @Get(':cycleId')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  getStatus(@Param('cycleId') cycleId: string) {
    return this.capacityService.getStatus(cycleId);
  }

  @Post('waitlist')
  @Roles('ADMIN', 'OPERATOR')
  joinWaitlist(
    @Body(new ZodValidationPipe(createWaitlistEntrySchema))
    dto: CreateWaitlistEntryDTO,
  ) {
    return this.capacityService.joinWaitlist(dto);
  }

  @Get('waitlist/:cycleId')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  listWaitlist(@Param('cycleId') cycleId: string) {
    return this.capacityService.listWaitlist(cycleId);
  }

  @Delete('waitlist/:id')
  @Roles('ADMIN')
  removeFromWaitlist(@Param('id') id: string) {
    return this.capacityService.removeFromWaitlist(id);
  }
}
