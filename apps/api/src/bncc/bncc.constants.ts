import { EixoBNCC } from '@prisma/client';

export const CANONICAL_LEVELS = ['EDUCACAO_INFANTIL', 'ENSINO_FUNDAMENTAL', 'ENSINO_MEDIO'] as const;
export type CanonicalLevel = (typeof CANONICAL_LEVELS)[number];
export const AXIS_LABELS: Record<EixoBNCC, string> = {
  PENSAMENTO_COMPUTACIONAL: 'Pensamento Computacional',
  MUNDO_DIGITAL: 'Mundo Digital',
  CULTURA_DIGITAL: 'Cultura Digital',
};
