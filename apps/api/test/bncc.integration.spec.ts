import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ROLES } from '../src/auth/decorators';
import { BnccAdminController } from '../src/bncc/bncc-admin.controller';
import { BnccController } from '../src/bncc/bncc.controller';
import { BnccService } from '../src/bncc/bncc.service';

describe('BNCC HTTP contracts', () => {
  let app: INestApplication | undefined;
  afterEach(async () => app?.close());

  it('valida a consulta docente, encaminha filtros e mantém curadoria restrita a ADMIN', async () => {
    const service = { skills: vi.fn().mockResolvedValue({ data: [], meta: { page: 2, pageSize: 20, total: 0, totalPages: 0 } }), adminSkills: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }) };
    const module = await Test.createTestingModule({ controllers: [BnccController, BnccAdminController], providers: [{ provide: BnccService, useValue: service }] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    await request(app.getHttpServer()).get('/bncc/skills?page=2&pageSize=20&q=rede').expect(200);
    expect(service.skills).toHaveBeenCalledWith(expect.objectContaining({ page: 2, pageSize: 20, q: 'rede' }));
    await request(app.getHttpServer()).get('/admin/bncc/skills?active=false').expect(200);
    expect(service.adminSkills).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
    expect(Reflect.getMetadata(ROLES, BnccAdminController)).toEqual([Role.ADMIN]);
  });
});
