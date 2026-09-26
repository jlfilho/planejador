import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';

describe('authentication HTTP flow', () => {
  let app: INestApplication | undefined;

  afterEach(async () => app?.close());

  it('creates a session and emits the refresh token only in an HttpOnly cookie', async () => {
    const user = { id: 'a7ed793e-cf8b-4f9e-9c16-4c0d4200a39a', email: 'teacher@example.com', role: Role.PROFESSOR, isActive: true };
    const auth = { register: async () => ({ user, session: { id: 'b7ed793e-cf8b-4f9e-9c16-4c0d4200a39a', token: 'refresh-value' } }), access: async () => 'access-value' };
    const users = { publicView: () => ({ id: user.id, email: user.email, role: user.role, active: true }) };
    const module = await Test.createTestingModule({ controllers: [AuthController], providers: [{ provide: AuthService, useValue: auth }, { provide: UsersService, useValue: users }] }).compile();
    app = module.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).post('/auth/register').send({ email: user.email, password: 'correct-horse-battery-staple' }).expect(201);
    expect(response.body).toMatchObject({ accessToken: 'access-value', user: { id: user.id, role: Role.PROFESSOR } });
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(response.headers['set-cookie'][0]).toContain('Path=/api/v1/auth');
    expect(JSON.stringify(response.body)).not.toContain('refresh-value');
  });
});
