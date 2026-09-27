import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { EixoBNCC } from '@prisma/client';

export class CatalogQueryDto {
  @IsOptional() @IsUUID() levelId?: string;
  @IsOptional() @IsUUID() stageId?: string;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) year?: number;
  @IsOptional() @IsEnum(EixoBNCC) axis?: EixoBNCC;
  @IsOptional() @IsString() @MaxLength(100) @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) q?: string;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) page = 1;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) @Max(100) pageSize = 20;
}
