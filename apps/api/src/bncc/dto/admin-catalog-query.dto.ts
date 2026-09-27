import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { CatalogQueryDto } from './catalog-query.dto';

export class AdminCatalogQueryDto extends CatalogQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  active?: boolean;
}
