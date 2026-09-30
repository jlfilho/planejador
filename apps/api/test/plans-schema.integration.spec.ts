import { PrismaClient } from '@prisma/client';
import { afterAll, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();
const expectedTables = ['AiRun', 'AiRunSkill', 'Plan', 'PlanReference'];
const expectedConstraints = [
  'AiRun_requesterId_fkey', 'AiRunSkill_aiRunId_fkey', 'AiRunSkill_habilidadeBNCCId_fkey',
  'Plan_ownerId_fkey', 'Plan_aiRunId_fkey', 'PlanReference_planId_fkey',
];
const expectedIndexes = [
  'AiRun_requestId_key', 'AiRun_idempotencyKey_key', 'AiRunSkill_aiRunId_habilidadeBNCCId_key',
  'AiRunSkill_aiRunId_ordem_key', 'Plan_aiRunId_key', 'PlanReference_planId_ordem_key',
];

afterAll(async () => prisma.$disconnect());

describe('plans migration on PostgreSQL', () => {
  it('installs plan tables, restrictive foreign keys and unique indexes', async () => {
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('AiRun', 'AiRunSkill', 'Plan', 'PlanReference')`;
    expect(tables.map((table) => table.table_name).sort()).toEqual(expectedTables.sort());

    const constraints = await prisma.$queryRaw<Array<{ conname: string; confdeltype: string }>>`SELECT conname, confdeltype FROM pg_constraint WHERE conname IN ('AiRun_requesterId_fkey', 'AiRunSkill_aiRunId_fkey', 'AiRunSkill_habilidadeBNCCId_fkey', 'Plan_ownerId_fkey', 'Plan_aiRunId_fkey', 'PlanReference_planId_fkey')`;
    expect(constraints.map((constraint) => constraint.conname).sort()).toEqual(expectedConstraints.sort());
    expect(constraints.filter((constraint) => constraint.conname !== 'AiRunSkill_aiRunId_fkey' && constraint.conname !== 'PlanReference_planId_fkey').every((constraint) => constraint.confdeltype === 'r')).toBe(true);

    const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname IN ('AiRun_requestId_key', 'AiRun_idempotencyKey_key', 'AiRunSkill_aiRunId_habilidadeBNCCId_key', 'AiRunSkill_aiRunId_ordem_key', 'Plan_aiRunId_key', 'PlanReference_planId_ordem_key')`;
    expect(indexes.map((index) => index.indexname).sort()).toEqual(expectedIndexes.sort());
  });
});
