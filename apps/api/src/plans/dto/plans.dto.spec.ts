import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreatePlanGenerationDto, N8nGenerationResponseDto, UpdatePlanDto } from './plans.dto';

const validId = '550e8400-e29b-41d4-a716-446655440000';
const errors = async (type: new () => object, value: unknown) => validate(plainToInstance(type, value), { whitelist: true, forbidNonWhitelisted: true });

describe('plan DTOs', () => {
  it('requires complete and valid generation input', async () => {
    await expect(errors(CreatePlanGenerationDto, { skillIds: [validId], instruction: 'Planejar atividade', durationMinutes: 50, usesDigitalResources: false })).resolves.toHaveLength(0);
    await expect(errors(CreatePlanGenerationDto, { skillIds: [validId, validId], instruction: ' ', durationMinutes: 0 })).resolves.not.toHaveLength(0);
    await expect(errors(CreatePlanGenerationDto, { skillIds: ['not-a-uuid'], instruction: 'Atividade', durationMinutes: 1, usesDigitalResources: true })).resolves.not.toHaveLength(0);
  });

  it('rejects empty Markdown and non-HTTPS references', async () => {
    await expect(errors(UpdatePlanDto, { markdown: '', references: [{ title: 'Fonte', url: 'http://example.com' }] })).resolves.not.toHaveLength(0);
    await expect(errors(UpdatePlanDto, { markdown: '# Aula', references: [{ title: 'Fonte', url: 'https://example.com' }] })).resolves.toHaveLength(0);
  });

  it('accepts exactly the external response shape for one lesson', async () => {
    await expect(errors(N8nGenerationResponseDto, { success: true, sessao: 'user-id', habilidade: 'EF01CO01 — Algoritmos', answer: '# Aula', format: 'markdown' })).resolves.toHaveLength(0);
    await expect(errors(N8nGenerationResponseDto, { lesson: { markdown: '# Aula' }, references: [] })).resolves.not.toHaveLength(0);
  });
});
