import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { n8nAuthHeaderName, n8nIntegrationSecret, n8nTimeoutMs, n8nWebhookUrl } from '../common/security-config';
import { N8nGenerationResponseDto, PlanReferenceDto } from './dto/plans.dto';

export type N8nRequest = { sessao: string; habilidade: string; instrucao: string; duracao: number; recursos_digitais: boolean };
export type N8nResponse = { markdown: string; references: PlanReferenceDto[] };
export type N8nFailureKind = 'timeout' | 'unavailable' | 'rejected' | 'invalid-response';

export class N8nGenerationError extends Error {
  constructor(readonly kind: N8nFailureKind) { super('Generation service did not complete'); }
}

@Injectable()
export class N8nClient {
  async generate(payload: N8nRequest): Promise<N8nResponse> {
    const body = JSON.stringify(payload);
    const options: RequestInit = { method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json; charset=utf-8', [n8nAuthHeaderName()]: n8nIntegrationSecret() }, body };

    try {
      const response = await fetch(n8nWebhookUrl(), { ...options, signal: AbortSignal.timeout(n8nTimeoutMs()) });
      if (!response.ok) throw new N8nGenerationError('rejected');
      const value: unknown = await response.json();
      if (!value || typeof value !== 'object' || Array.isArray(value) || 'lessons' in value) throw new N8nGenerationError('invalid-response');
      const parsed = plainToInstance(N8nGenerationResponseDto, value);
      const issues = await validate(parsed, { whitelist: true, forbidNonWhitelisted: true });
      if (issues.length) throw new N8nGenerationError('invalid-response');
      if (parsed.sessao !== payload.sessao || parsed.habilidade !== payload.habilidade) throw new N8nGenerationError('invalid-response');
      return { markdown: parsed.answer.trim(), references: [] };
    } catch (error) {
      if (error instanceof N8nGenerationError) throw error;
      const kind: N8nFailureKind = error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'unavailable';
      throw new N8nGenerationError(kind);
    }
  }
}
