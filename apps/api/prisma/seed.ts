import { PrismaClient } from '@prisma/client';
import { bnccCatalog } from './seed-data/bncc-computacao';

const prisma = new PrismaClient();

function ensureCatalogValid() {
  const skillCodes = new Set<string>();
  const stageNames = new Set<string>();

  for (const level of bnccCatalog) {
    for (const stage of level.stages) {
      const stageNameKey = `${level.code}:${stage.name}`;
      if (stageNames.has(stageNameKey)) throw new Error(`Etapa BNCC duplicada: ${stageNameKey}`);
      stageNames.add(stageNameKey);

      if (level.code === 'EDUCACAO_INFANTIL') {
        if (stage.yearStart !== null || stage.yearEnd !== null) throw new Error(`Educação Infantil não aceita anos: ${stage.code}`);
      } else {
        const maximumYear = level.code === 'ENSINO_FUNDAMENTAL' ? 9 : level.code === 'ENSINO_MEDIO' ? 3 : null;
        if (maximumYear === null || stage.yearStart === null || stage.yearEnd === null || stage.yearStart < 1 || stage.yearStart > stage.yearEnd || stage.yearEnd > maximumYear) {
          throw new Error(`Intervalo de anos inválido para ${level.code}/${stage.code}`);
        }
      }

      for (const skill of stage.skills) {
        if (skillCodes.has(skill.code)) throw new Error(`Código BNCC duplicado: ${skill.code}`);
        if (!skill.examples.length || skill.examples.some(example => !example.trim())) throw new Error(`Habilidade sem exemplo válido: ${skill.code}`);
        skillCodes.add(skill.code);
      }
    }
  }
}

async function main() {
  ensureCatalogValid();

  await prisma.$transaction(async tx => {
    for (const level of bnccCatalog) {
      const existing = await tx.nivelEnsino.findUnique({ where: { codigo: level.code } });
      const dbLevel = existing ?? await tx.nivelEnsino.create({ data: { codigo: level.code, nome: level.name } });
      if (existing && existing.nome !== level.name) console.warn(`Curadoria divergente no nível ${level.code}; preservada.`);

      for (const stage of level.stages) {
        const dbStage = await tx.etapaEnsino.upsert({
          where: { nivelEnsinoId_codigo: { nivelEnsinoId: dbLevel.id, codigo: stage.code } },
          update: {},
          create: { nivelEnsinoId: dbLevel.id, codigo: stage.code, nome: stage.name, anoInicial: stage.yearStart, anoFinal: stage.yearEnd },
        });

        for (const skill of stage.skills) {
          if (await tx.habilidadeBNCC.findUnique({ where: { codigo: skill.code } })) continue;
          await tx.habilidadeBNCC.create({
            data: {
              etapaEnsinoId: dbStage.id,
              codigo: skill.code,
              eixo: skill.axis,
              descricao: skill.description,
              explicacao: skill.explanation,
              exemplos: { create: skill.examples.map((texto, index) => ({ texto, ordem: index + 1 })) },
            },
          });
        }
      }
    }
  });
}

main().finally(() => prisma.$disconnect());
