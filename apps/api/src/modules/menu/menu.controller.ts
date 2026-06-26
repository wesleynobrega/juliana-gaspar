import {
  Controller,
  Get,
  Post,
  Put,
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
import { MenuService } from './menu.service';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  createTechnicalSheetSchema,
  updateTechnicalSheetSchema,
  createSpecialRequestSchema,
  updateSpecialRequestSchema,
  type CreateMenuItemDTO,
  type UpdateMenuItemDTO,
  type CreateTechnicalSheetDTO,
  type UpdateTechnicalSheetDTO,
  type CreateSpecialRequestDTO,
  type UpdateSpecialRequestDTO,
} from '@juliana-gaspar/contracts';

@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(private menuService: MenuService) {}

  // ── MenuItem ───────────────────────────────────────

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('nutrientType') nutrientType?: string,
  ) {
    return this.menuService.findAll(+page, +limit, nutrientType);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) {
    return this.menuService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(
    @Body(new ZodValidationPipe(createMenuItemSchema)) dto: CreateMenuItemDTO,
  ) {
    return this.menuService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMenuItemSchema)) dto: UpdateMenuItemDTO,
  ) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }

  // ── TechnicalSheet ─────────────────────────────────

  @Get(':id/technical-sheet')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  getTechnicalSheet(@Param('id') id: string) {
    return this.menuService.getTechnicalSheet(id);
  }

  @Post(':id/technical-sheet')
  @Roles('ADMIN', 'OPERATOR')
  upsertTechnicalSheet(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createTechnicalSheetSchema))
    dto: CreateTechnicalSheetDTO,
  ) {
    return this.menuService.upsertTechnicalSheet(id, dto);
  }

  @Put(':id/technical-sheet')
  @Roles('ADMIN', 'OPERATOR')
  updateTechnicalSheet(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTechnicalSheetSchema))
    dto: UpdateTechnicalSheetDTO,
  ) {
    return this.menuService.upsertTechnicalSheet(id, dto);
  }

  // ── SpecialRequests ────────────────────────────────

  @Get('special-requests/all')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAllSpecialRequests(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.menuService.findAllSpecialRequests(+page, +limit);
  }

  @Post('special-requests')
  @Roles('ADMIN', 'OPERATOR')
  createSpecialRequest(
    @Body(new ZodValidationPipe(createSpecialRequestSchema))
    dto: CreateSpecialRequestDTO,
  ) {
    return this.menuService.createSpecialRequest(dto);
  }

  @Put('special-requests/:reqId')
  @Roles('ADMIN', 'OPERATOR')
  updateSpecialRequest(
    @Param('reqId') reqId: string,
    @Body(new ZodValidationPipe(updateSpecialRequestSchema))
    dto: UpdateSpecialRequestDTO,
  ) {
    return this.menuService.updateSpecialRequest(reqId, dto);
  }
}
