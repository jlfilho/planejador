import { Role } from '@prisma/client';

export const bnccFixtures = {
  admin: { id: '11111111-1111-4111-8111-111111111111', email: 'admin@example.test', role: Role.ADMIN, isActive: true },
  professor: { id: '22222222-2222-4222-8222-222222222222', email: 'professor@example.test', role: Role.PROFESSOR, isActive: true },
  level: { id: '33333333-3333-4333-8333-333333333333', codigo: 'ENSINO_FUNDAMENTAL', nome: 'Ensino Fundamental', ativo: true },
  stage: { id: '44444444-4444-4444-8444-444444444444', codigo: 'EF01', nome: '1º ano', anoInicial: 1, anoFinal: 1, ativo: true },
  skill: { id: '55555555-5555-4555-8555-555555555555', codigo: 'EF01CO01', eixo: 'PENSAMENTO_COMPUTACIONAL', descricao: 'Reconhecer padrões.', explicacao: 'Identifica regularidades.', ativa: true, exemplos: [{ texto: 'Sequências de formas.', ordem: 1 }] },
} as const;
