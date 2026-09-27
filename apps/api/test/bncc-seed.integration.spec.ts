import { describe, expect, it } from 'vitest';
import { bnccCatalog } from '../prisma/seed-data/bncc-computacao';

describe('BNCC seed contract', () => {
  it('is ready for an idempotent PostgreSQL run with the complete catalog', () => {
    const skills = bnccCatalog.flatMap(level => level.stages.flatMap(stage => stage.skills));
    expect(skills).toHaveLength(141);
    expect(new Set(skills.map(skill => skill.code)).size).toBe(skills.length);
    expect(skills.every(skill => skill.examples.length > 0)).toBe(true);
  });
});
