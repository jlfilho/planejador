import 'reflect-metadata';
import { BadGatewayException, GatewayTimeoutException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlansController } from '../src/plans/plans.controller';
import { PlansService } from '../src/plans/plans.service';

describe('plan-generation failure HTTP contract', () => {
  let app: INestApplication | undefined;
  afterEach(async () => app?.close());
  it.each([[new BadGatewayException('A geração não foi concluída. Tente novamente.'), 502], [new GatewayTimeoutException('A geração não foi concluída. Tente novamente.'), 504]])('returns a generic failure for %i', async (failure, status) => {
    const service = { generate: vi.fn().mockRejectedValue(failure) }; const module = await Test.createTestingModule({ controllers: [PlansController], providers: [{ provide: PlansService, useValue: service }] }).compile(); app = module.createNestApplication(); await app.init();
    await request(app.getHttpServer()).post('/plans/generations').send({ skillIds: ['550e8400-e29b-41d4-a716-446655440000'], instruction: 'Aula', durationMinutes: 50, usesDigitalResources: false }).expect(status).expect(({ body }) => expect(JSON.stringify(body)).not.toContain('N8N_INTEGRATION_SECRET'));
  });
});
