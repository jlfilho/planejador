import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { EixoBNCC } from '@prisma/client';
import { CANONICAL_LEVELS } from '../bncc.constants';

export class CreateLevelDto { @IsEnum(CANONICAL_LEVELS) code!: string; @IsString() @IsNotEmpty() @MaxLength(100) name!: string; }
export class UpdateLevelDto { @IsOptional() @IsString() @IsNotEmpty() @MaxLength(100) name?: string; @IsOptional() @IsBoolean() active?: boolean; }
export class CreateStageDto { @IsString() @IsNotEmpty() @MaxLength(40) code!: string; @IsString() @IsNotEmpty() @MaxLength(100) name!: string; @IsOptional() @Type(() => Number) @IsInt() @Min(1) yearStart?: number | null; @IsOptional() @Type(() => Number) @IsInt() @Min(1) yearEnd?: number | null; }
export class UpdateStageDto { @IsOptional() @IsString() @IsNotEmpty() @MaxLength(100) name?: string; @IsOptional() @Type(() => Number) @IsInt() @Min(1) yearStart?: number | null; @IsOptional() @Type(() => Number) @IsInt() @Min(1) yearEnd?: number | null; @IsOptional() @IsBoolean() active?: boolean; }
export class CreateSkillDto { @IsString() @IsNotEmpty() @MaxLength(40) code!: string; @IsOptional() @IsEnum(EixoBNCC) axis?: EixoBNCC; @IsString() @IsNotEmpty() description!: string; @IsString() @IsNotEmpty() explanation!: string; @IsArray() @ArrayMinSize(1) @IsString({ each: true }) @IsNotEmpty({ each: true }) examples!: string[]; }
export class UpdateSkillDto { @IsOptional() @IsEnum(EixoBNCC) axis?: EixoBNCC | null; @IsOptional() @IsString() @IsNotEmpty() description?: string; @IsOptional() @IsString() @IsNotEmpty() explanation?: string; @IsOptional() @IsArray() @ArrayMinSize(1) @IsString({ each: true }) @IsNotEmpty({ each: true }) examples?: string[]; @IsOptional() @IsBoolean() active?: boolean; }
