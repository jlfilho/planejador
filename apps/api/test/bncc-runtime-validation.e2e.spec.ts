import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { BnccController } = require('../dist/bncc/bncc.controller') as typeof import('../src/bncc/bncc.controller');
const { BnccService } = require('../dist/bncc/bncc.service') as typeof import('../src/bncc/bncc.service');

describe('BNCC runtime validation', () => {
  let app: INestApplication | undefined;
  afterEach(async () => app?.close());

  it('rejects invalid query DTOs before invoking the catalog service', async () => {
    const service = { skills: vi.fn(), levels: vi.fn(), stages: vi.fn() };
    const module = await Test.createTestingModule({ controllers: [BnccController], providers: [{ provide: BnccService, useValue: service }] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    await request(app.getHttpServer()).get('/bncc/skills?axis=INVALID&page=0&pageSize=101').expect(400);
    expect(service.skills).not.toHaveBeenCalled();
  });
});
