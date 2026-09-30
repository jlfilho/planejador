import { Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, Equals, IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, MaxLength, Min, ValidateNested } from 'class-validator';

export class CreatePlanGenerationDto {
  @IsArray() @ArrayNotEmpty() @ArrayUnique() @IsUUID('4', { each: true }) skillIds!: string[];
  @IsString() @IsNotEmpty() @MaxLength(4000) instruction!: string;
  @IsInt() @Min(1) durationMinutes!: number;
  @IsBoolean() usesDigitalResources!: boolean;
}

export class PlanReferenceDto {
  @IsString() @IsNotEmpty() @MaxLength(300) title!: string;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(2000) url?: string;
  @IsOptional() @IsString() @MaxLength(2000) citation?: string;
}

export class UpdatePlanDto {
  @IsString() @IsNotEmpty() @MaxLength(60000) markdown!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => PlanReferenceDto) references!: PlanReferenceDto[];
}

export class N8nGenerationResponseDto {
  @IsBoolean() @Equals(true) success!: boolean;
  @IsString() @IsNotEmpty() sessao!: string;
  @IsString() @IsNotEmpty() habilidade!: string;
  @IsString() @IsNotEmpty() @MaxLength(60000) answer!: string;
  @IsString() @Equals('markdown') format!: string;
}
