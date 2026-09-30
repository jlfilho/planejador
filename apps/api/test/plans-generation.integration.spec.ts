import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlansController } from '../src/plans/plans.controller';
import { CreatePlanGenerationDto } from '../src/plans/dto/plans.dto';
import { PlansService } from '../src/plans/plans.service';

describe('plan generation HTTP contract', () => {
  let app: INestApplication | undefined;
  afterEach(async () => app?.close());
  it('validates invalid input before a generation can be passed to the service', async () => {
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
    await expect(pipe.transform({ skillIds: [], instruction: '', durationMinutes: 0 }, { type: 'body', metatype: CreatePlanGenerationDto })).rejects.toMatchObject({ status: 400 });
    const service = { generate: vi.fn().mockResolvedValue({ id: 'plan' }) }; const module = await Test.createTestingModule({ controllers: [PlansController], providers: [{ provide: PlansService, useValue: service }] }).compile(); app = module.createNestApplication(); app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })); await app.init();
    await request(app.getHttpServer()).post('/plans/generations').send({ skillIds: ['550e8400-e29b-41d4-a716-446655440000'], instruction: 'Aula', durationMinutes: 50, usesDigitalResources: false }).expect(201); expect(service.generate).toHaveBeenCalledTimes(1);
  });
});
