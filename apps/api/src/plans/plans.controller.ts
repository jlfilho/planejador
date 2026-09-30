import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePlanGenerationDto, UpdatePlanDto } from './dto/plans.dto';
import { PlansService } from './plans.service';

@ApiTags('Plans') @ApiBearerAuth() @Controller('plans')
export class PlansController {
  constructor(@Inject(PlansService) private readonly plans: PlansService) {}
  @Post('generations') @ApiCreatedResponse({ description: 'Rascunho criado após resposta válida.' }) @ApiResponse({ status: 502, description: 'Geração indisponível ou inválida.' }) @ApiResponse({ status: 504, description: 'Tempo de geração excedido.' }) generate(@Body() dto: CreatePlanGenerationDto, @Req() req: any) { return this.plans.generate(dto, req.user); }
  @Get() @ApiOkResponse({ description: 'Planos autorizados.' }) list(@Req() req: any) { return this.plans.list(req.user); }
  @Get(':planId') @ApiOkResponse({ description: 'Plano autorizado.' }) detail(@Param('planId', new ParseUUIDPipe({ version: '4' })) planId: string, @Req() req: any) { return this.plans.detail(planId, req.user); }
  @Patch(':planId') @ApiOkResponse({ description: 'Rascunho salvo.' }) @ApiResponse({ status: 409, description: 'Plano finalizado.' }) update(@Param('planId', new ParseUUIDPipe({ version: '4' })) planId: string, @Body() dto: UpdatePlanDto, @Req() req: any) { return this.plans.update(planId, dto, req.user); }
  @Post(':planId/finalize') @ApiOkResponse({ description: 'Plano finalizado explicitamente.' }) @ApiResponse({ status: 409, description: 'Plano já finalizado.' }) finalize(@Param('planId', new ParseUUIDPipe({ version: '4' })) planId: string, @Req() req: any) { return this.plans.finalize(planId, req.user); }
}
