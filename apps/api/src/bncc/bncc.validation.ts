import { BadRequestException } from '@nestjs/common';

export function assertStageYears(levelCode: string, start: number | null, end: number | null) {
  if (levelCode === 'EDUCACAO_INFANTIL') {
    if (start !== null || end !== null) throw new BadRequestException('Educação Infantil não possui ano.');
    return;
  }
  if (start === null || end === null || start > end) throw new BadRequestException('A etapa deve informar um intervalo de anos válido.');
  const maximum = levelCode === 'ENSINO_FUNDAMENTAL' ? 9 : 3;
  if (start < 1 || end > maximum) throw new BadRequestException(`Ano deve estar entre 1 e ${maximum}.`);
}

export function assertQueryYear(levelCode: string, year?: number) {
  if (year === undefined) return;
  if (levelCode === 'EDUCACAO_INFANTIL') throw new BadRequestException('Educação Infantil não possui ano.');
  const maximum = levelCode === 'ENSINO_FUNDAMENTAL' ? 9 : 3;
  if (year < 1 || year > maximum) throw new BadRequestException(`Ano deve estar entre 1 e ${maximum}.`);
}
