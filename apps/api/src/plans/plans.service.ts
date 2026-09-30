import { BadGatewayException, BadRequestException, ConflictException, ForbiddenException, GatewayTimeoutException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AiRunStatus, AuditResult, PlanStatus, Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../common/prisma.service';
import { CreatePlanGenerationDto, UpdatePlanDto } from './dto/plans.dto';
import { N8nClient, N8nGenerationError } from './n8n.client';

type Actor = { sub: string; role: Role };
const planInclude = { owner: { select: { id: true, email: true } }, references: { orderBy: { ordem: 'asc' as const } }, aiRun: { include: { skills: { orderBy: { ordem: 'asc' as const }, include: { habilidade: true } } } } };

@Injectable()
export class PlansService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(AuditService) private readonly audit: AuditService, @Inject(N8nClient) private readonly n8n: N8nClient) {}

  async generate(dto: CreatePlanGenerationDto, actor: Actor) {
    const skills = await this.prisma.habilidadeBNCC.findMany({ where: { id: { in: dto.skillIds }, ativa: true, etapa: { ativo: true, nivel: { ativo: true } } }, include: { etapa: true } });
    if (skills.length !== dto.skillIds.length) throw new BadRequestException('Habilidades selecionadas são inválidas ou inativas.');
    const byId = new Map(skills.map((skill) => [skill.id, skill]));
    const requestId = randomUUID(); const idempotencyKey = randomUUID();
    const run = await this.prisma.$transaction(async (tx) => {
      const created = await tx.aiRun.create({ data: { requesterId: actor.sub, requestId, idempotencyKey, instruction: dto.instruction.trim(), durationMinutes: dto.durationMinutes, usesDigitalResources: dto.usesDigitalResources, skills: { create: dto.skillIds.map((id, index) => ({ habilidadeBNCCId: id, ordem: index + 1 })) } } });
      await this.audit.logWith(tx, 'PLAN_GENERATION_STARTED', AuditResult.SUCCESS, actor.sub, undefined, { aiRunId: created.id, requestId });
      return created;
    });
    try {
      const habilidade = dto.skillIds.map((id) => { const skill = byId.get(id)!; return `${skill.codigo} — ${skill.descricao}`; }).join('\n\n');
      const response = await this.n8n.generate({ sessao: actor.sub, habilidade, instrucao: run.instruction, duracao: run.durationMinutes, recursos_digitais: run.usesDigitalResources });
      return await this.prisma.$transaction(async (tx) => {
        const transition = await tx.aiRun.updateMany({ where: { id: run.id, status: AiRunStatus.PENDING }, data: { status: AiRunStatus.SUCCEEDED, completedAt: new Date() } });
        if (!transition.count) throw new ConflictException('A geração não está disponível.');
        const plan = await tx.plan.create({ data: { ownerId: actor.sub, aiRunId: run.id, status: PlanStatus.RASCUNHO, markdown: response.markdown, aiAssisted: true, references: { create: response.references.map((reference, index) => ({ title: reference.title, ...(reference.url ? { url: reference.url } : {}), ...(reference.citation ? { citation: reference.citation } : {}), ordem: index + 1 })) } }, include: planInclude });
        await this.audit.logWith(tx, 'PLAN_GENERATION_SUCCEEDED', AuditResult.SUCCESS, actor.sub, undefined, { aiRunId: run.id, planId: plan.id, requestId });
        return plan;
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      const kind = error instanceof N8nGenerationError ? error.kind : 'unavailable';
      await this.prisma.$transaction(async (tx) => { await tx.aiRun.updateMany({ where: { id: run.id, status: AiRunStatus.PENDING }, data: { status: AiRunStatus.FAILED, failureCode: kind, completedAt: new Date() } }); await this.audit.logWith(tx, 'PLAN_GENERATION_FAILED', AuditResult.FAILURE, actor.sub, undefined, { aiRunId: run.id, requestId, failureCode: kind }); });
      if (kind === 'timeout') throw new GatewayTimeoutException('A geração não foi concluída. Tente novamente.');
      throw new BadGatewayException('A geração não foi concluída. Tente novamente.');
    }
  }

  list(actor: Actor) { return this.prisma.plan.findMany({ where: actor.role === Role.ADMIN ? {} : { ownerId: actor.sub }, include: planInclude, orderBy: { updatedAt: 'desc' } }); }
  async detail(id: string, actor: Actor) {
    const plan = await this.prisma.plan.findUnique({ where: { id }, include: planInclude });
    if (!plan) throw new NotFoundException('Plano não encontrado.');
    if (actor.role !== Role.ADMIN && plan.ownerId !== actor.sub) throw new ForbiddenException('Acesso ao plano não autorizado.');
    if (actor.role === Role.ADMIN && plan.ownerId !== actor.sub) await this.audit.log('PLAN_ADMIN_VIEWED', AuditResult.SUCCESS, actor.sub, undefined, { planId: id });
    return plan;
  }
  async update(id: string, dto: UpdatePlanDto, actor: Actor) {
    const plan = await this.detail(id, actor);
    if (plan.status !== PlanStatus.RASCUNHO) throw new ConflictException('Plano finalizado não pode ser alterado.');
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.plan.findUnique({ where: { id }, select: { status: true } });
      if (!current || current.status !== PlanStatus.RASCUNHO) throw new ConflictException('Plano finalizado não pode ser alterado.');
      const updated = await tx.plan.update({ where: { id }, data: { markdown: dto.markdown.trim(), references: { deleteMany: {}, create: dto.references.map((reference, index) => ({ title: reference.title.trim(), ...(reference.url ? { url: reference.url } : {}), ...(reference.citation ? { citation: reference.citation.trim() } : {}), ordem: index + 1 })) } }, include: planInclude });
      await this.audit.logWith(tx, 'PLAN_SAVED', AuditResult.SUCCESS, actor.sub, undefined, { planId: id, ownerId: plan.ownerId }); return updated;
    });
  }
  async finalize(id: string, actor: Actor) {
    const plan = await this.detail(id, actor);
    if (plan.ownerId !== actor.sub) throw new ForbiddenException('Somente o professor proprietário pode finalizar o plano.');
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.plan.updateMany({ where: { id, ownerId: actor.sub, status: PlanStatus.RASCUNHO }, data: { status: PlanStatus.FINALIZADO, finalizedAt: new Date() } });
      if (!result.count) throw new ConflictException('Plano finalizado não pode ser alterado.');
      const updated = await tx.plan.findUniqueOrThrow({ where: { id }, include: planInclude });
      await this.audit.logWith(tx, 'PLAN_FINALIZED', AuditResult.SUCCESS, actor.sub, undefined, { planId: id }); return updated;
    });
  }
}
