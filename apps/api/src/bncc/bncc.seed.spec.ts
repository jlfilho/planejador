import { describe, expect, it } from 'vitest';
import { bnccCatalog } from '../../prisma/seed-data/bncc-computacao';

describe('dataset BNCC Computação', () => {
  it('possui códigos globais únicos e ao menos um exemplo por habilidade', () => {
    const skills = bnccCatalog.flatMap(level => level.stages.flatMap(stage => stage.skills));
    expect(skills).toHaveLength(141);
    expect(new Set(skills.map(skill => skill.code)).size).toBe(skills.length);
    expect(skills.every(skill => skill.examples.length > 0 && skill.examples.every(example => example.trim().length > 0))).toBe(true);
  });

  it('mantém eixos pendentes explicitamente nulos', () => {
    const skills = bnccCatalog.flatMap(level => level.stages.flatMap(stage => stage.skills));
    expect(skills.some(skill => skill.axis === null)).toBe(true);
    expect(skills.filter(skill => skill.axis !== null).every(skill => ['PENSAMENTO_COMPUTACIONAL', 'MUNDO_DIGITAL', 'CULTURA_DIGITAL'].includes(skill.axis!))).toBe(true);
  });

  it('normaliza etapas para as restrições de unicidade e anos do Prisma', () => {
    const stages = bnccCatalog.flatMap(level => level.stages.map(stage => ({ level: level.code, ...stage })));
    expect(stages).toHaveLength(13);

    for (const stage of stages) {
      if (stage.level === 'EDUCACAO_INFANTIL') {
        expect(stage.yearStart).toBeNull();
        expect(stage.yearEnd).toBeNull();
      } else {
        expect(stage.yearStart).not.toBeNull();
        expect(stage.yearEnd).not.toBeNull();
        expect(stage.yearStart).toBeLessThanOrEqual(stage.yearEnd!);
        expect(stage.yearEnd).toBeLessThanOrEqual(stage.level === 'ENSINO_FUNDAMENTAL' ? 9 : 3);
      }
    }

    const keys = stages.map(stage => `${stage.level}:${stage.name}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(stages.find(stage => stage.code === 'EF01')).toMatchObject({ name: '1º ano', yearStart: 1, yearEnd: 1 });
    expect(stages.find(stage => stage.code === 'EF15')).toMatchObject({ name: '1º ao 5º ano', yearStart: 1, yearEnd: 5 });
    expect(stages.find(stage => stage.code === 'EF69')).toMatchObject({ name: '6º ao 9º ano', yearStart: 6, yearEnd: 9 });
  });
});
