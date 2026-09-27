import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators';
import { BnccService } from './bncc.service';
import { CreateLevelDto, CreateSkillDto, CreateStageDto, UpdateLevelDto, UpdateSkillDto, UpdateStageDto } from './dto/bncc-admin.dto';
import { AdminCatalogQueryDto } from './dto/admin-catalog-query.dto';

const normalizeNumbers = (query: AdminCatalogQueryDto): AdminCatalogQueryDto => { const active = query.active as unknown; return { ...query, page: Number(query.page), pageSize: Number(query.pageSize), active: active === 'true' ? true : active === 'false' ? false : query.active }; };

@ApiTags('BNCC Administration') @ApiBearerAuth() @Roles(Role.ADMIN) @Controller('admin/bncc')
export class BnccAdminController {
  constructor(@Inject(BnccService) private readonly bncc: BnccService) {}
  @Get('levels') @ApiOkResponse({ description: 'Níveis, inclusive inativos.' }) levels() { return this.bncc.levels(true); }
  @Post('levels') @ApiCreatedResponse({ description: 'Nível criado.' }) @ApiResponse({ status: 409, description: 'Nível duplicado.' }) createLevel(@Body() dto: CreateLevelDto, @Req() req: any) { return this.bncc.createLevel(dto, req.user.sub); }
  @Patch('levels/:id') @ApiOkResponse({ description: 'Nível atualizado.' }) @ApiResponse({ status: 404, description: 'Nível inexistente.' }) @ApiResponse({ status: 409, description: 'Conflito de unicidade.' }) updateLevel(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateLevelDto, @Req() req: any) { return this.bncc.updateLevel(id, dto, req.user.sub); }
  @Get('levels/:levelId/stages') @ApiOkResponse({ description: 'Etapas, inclusive inativas.' }) @ApiResponse({ status: 404, description: 'Nível inexistente.' }) stages(@Param('levelId', new ParseUUIDPipe({ version: '4' })) levelId: string) { return this.bncc.stages(levelId, true); }
  @Post('levels/:levelId/stages') @ApiCreatedResponse({ description: 'Etapa criada.' }) @ApiResponse({ status: 409, description: 'Etapa duplicada.' }) createStage(@Param('levelId', new ParseUUIDPipe({ version: '4' })) levelId: string, @Body() dto: CreateStageDto, @Req() req: any) { return this.bncc.createStage(levelId, dto, req.user.sub); }
  @Patch('stages/:id') @ApiOkResponse({ description: 'Etapa atualizada.' }) @ApiResponse({ status: 404, description: 'Etapa inexistente.' }) @ApiResponse({ status: 409, description: 'Etapa duplicada.' }) updateStage(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateStageDto, @Req() req: any) { return this.bncc.updateStage(id, dto, req.user.sub); }
  @Get('skills') @ApiOkResponse({ description: 'Página de habilidades, inclusive inativas.' }) skills(@Query() query: AdminCatalogQueryDto) { return this.bncc.adminSkills(normalizeNumbers(query)); }
  @Post('stages/:stageId/skills') @ApiCreatedResponse({ description: 'Habilidade criada.' }) @ApiResponse({ status: 409, description: 'Código BNCC duplicado.' }) createSkill(@Param('stageId', new ParseUUIDPipe({ version: '4' })) stageId: string, @Body() dto: CreateSkillDto, @Req() req: any) { return this.bncc.createSkill(stageId, dto, req.user.sub); }
  @Patch('skills/:id') @ApiOkResponse({ description: 'Habilidade atualizada.' }) @ApiResponse({ status: 404, description: 'Habilidade inexistente.' }) updateSkill(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateSkillDto, @Req() req: any) { return this.bncc.updateSkill(id, dto, req.user.sub); }
}
