import 'reflect-metadata';
import { ForbiddenException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlansController } from '../src/plans/plans.controller';
import { PlansService } from '../src/plans/plans.service';

describe('plan access HTTP contract', () => {
  let app: INestApplication | undefined;
  afterEach(async () => app?.close());
  it('does not serialize a private plan when the service denies access', async () => {
    const service = { detail: vi.fn().mockRejectedValue(new ForbiddenException('Acesso ao plano não autorizado.')) }; const module = await Test.createTestingModule({ controllers: [PlansController], providers: [{ provide: PlansService, useValue: service }] }).compile(); app = module.createNestApplication(); await app.init();
    await request(app.getHttpServer()).get('/plans/550e8400-e29b-41d4-a716-446655440000').expect(403).expect(({ body }) => expect(JSON.stringify(body)).not.toContain('markdown'));
  });
});
