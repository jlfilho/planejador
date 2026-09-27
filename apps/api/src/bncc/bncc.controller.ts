import { Controller, Get, Inject, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { BnccService } from './bncc.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';

const normalizeNumbers = <T extends CatalogQueryDto>(query: T): T => ({ ...query, year: query.year === undefined ? undefined : Number(query.year), page: Number(query.page), pageSize: Number(query.pageSize) });

@ApiTags('BNCC Catalog') @ApiBearerAuth() @Controller('bncc')
export class BnccController {
  constructor(@Inject(BnccService) private readonly bncc: BnccService) {}
  @Get('levels') @ApiOkResponse({ description: 'Níveis ativos' }) levels() { return this.bncc.levels(); }
  @Get('levels/:levelId/stages') @ApiOkResponse({ description: 'Etapas ativas do nível' }) stages(@Param('levelId', new ParseUUIDPipe({ version: '4' })) levelId: string) { return this.bncc.stages(levelId); }
  @Get('skills') @ApiOkResponse({ description: 'Página de habilidades ativas' }) skills(@Query() query: CatalogQueryDto) { return this.bncc.skills(normalizeNumbers(query)); }
}
