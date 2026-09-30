import { BadGatewayException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { PlansService } from './plans.service';

const owner = { sub: '550e8400-e29b-41d4-a716-446655440001', role: Role.PROFESSOR };
const anotherTeacher = { sub: '550e8400-e29b-41d4-a716-446655440002', role: Role.PROFESSOR };
const admin = { sub: '550e8400-e29b-41d4-a716-446655440003', role: Role.ADMIN };
const skillId = '550e8400-e29b-41d4-a716-446655440000';

function createService(overrides: Record<string, unknown> = {}) {
  const tx = { aiRun: { create: vi.fn().mockResolvedValue({ id: 'run', instruction: 'Aula', durationMinutes: 50, usesDigitalResources: false }), updateMany: vi.fn().mockResolvedValue({ count: 1 }) }, plan: { create: vi.fn().mockResolvedValue({ id: 'plan', ownerId: owner.sub, status: 'RASCUNHO', aiAssisted: true, references: [] }), findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn(), updateMany: vi.fn().mockResolvedValue({ count: 1 }) } };
  const prisma = { habilidadeBNCC: { findMany: vi.fn().mockResolvedValue([{ id: skillId, codigo: 'EF01CO01', descricao: 'Algoritmos', etapa: {} }]) }, plan: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn() }, $transaction: vi.fn(async (operation: (client: typeof tx) => unknown) => operation(tx)), ...overrides };
  const audit = { log: vi.fn(), logWith: vi.fn() }; const n8n = { generate: vi.fn().mockResolvedValue({ markdown: '# Aula', references: [{ title: 'BNCC' }] }) };
  return { service: new PlansService(prisma as never, audit as never, n8n as never), prisma, tx, audit, n8n };
}

describe('PlansService', () => {
  it('does not call n8n or create a run for inactive or unknown skills', async () => {
    const { service, prisma, n8n } = createService({ habilidadeBNCC: { findMany: vi.fn().mockResolvedValue([]) } });
    await expect(service.generate({ skillIds: [skillId], instruction: 'Aula', durationMinutes: 50, usesDigitalResources: false }, owner)).rejects.toThrow('inválidas ou inativas');
    expect(prisma.$transaction).not.toHaveBeenCalled(); expect(n8n.generate).not.toHaveBeenCalled();
  });

  it('creates an immutable successful run and a draft owned by its requester only after a valid answer', async () => {
    const { service, tx, n8n } = createService();
    const result = await service.generate({ skillIds: [skillId], instruction: ' Aula ', durationMinutes: 50, usesDigitalResources: false }, owner);
    expect(tx.aiRun.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ requesterId: owner.sub, instruction: 'Aula', skills: { create: [{ habilidadeBNCCId: skillId, ordem: 1 }] } }) }));
    expect(n8n.generate).toHaveBeenCalledWith({ sessao: owner.sub, habilidade: 'EF01CO01 — Algoritmos', instrucao: 'Aula', duracao: 50, recursos_digitais: false });
    expect(tx.plan.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ ownerId: owner.sub, aiRunId: 'run', status: 'RASCUNHO', aiAssisted: true }) })); expect(result).toMatchObject({ id: 'plan', ownerId: owner.sub });
  });

  it('leaves no plan when the external generator fails', async () => {
    const { service, tx, n8n } = createService(); n8n.generate.mockRejectedValue(new Error('offline'));
    await expect(service.generate({ skillIds: [skillId], instruction: 'Aula', durationMinutes: 50, usesDigitalResources: false }, owner)).rejects.toBeInstanceOf(BadGatewayException);
    expect(tx.plan.create).not.toHaveBeenCalled(); expect(tx.aiRun.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED' }) }));
  });

  it('enforces ownership while letting ADMIN access an owned plan', async () => {
    const { service, prisma, audit } = createService(); prisma.plan.findUnique.mockResolvedValue({ id: 'plan', ownerId: owner.sub, status: 'RASCUNHO', references: [], aiRun: { skills: [] } });
    await expect(service.detail('plan', anotherTeacher)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.detail('plan', admin)).resolves.toMatchObject({ ownerId: owner.sub }); expect(audit.log).toHaveBeenCalledWith('PLAN_ADMIN_VIEWED', 'SUCCESS', admin.sub, undefined, { planId: 'plan' });
  });

  it('does not let ADMIN finalize a plan owned by another professor', async () => {
    const { service, prisma } = createService(); prisma.plan.findUnique.mockResolvedValue({ id: 'plan', ownerId: owner.sub, status: 'RASCUNHO', references: [], aiRun: { skills: [] } });
    await expect(service.finalize('plan', admin)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
