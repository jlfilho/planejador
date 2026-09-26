import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { AuditResult, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { accessTokenSecret } from '../common/security-config';

const ttlDays = () => Number(process.env.REFRESH_TTL_DAYS ?? 7);
const DUMMY_PASSWORD_HASH = '$argon2id$v=19$m=65536,t=3,p=4$XHdq0i9ShxFerRmUMOnCTg$YpHdlhIpjy9lyt1/r78nZS7OufnNKocsGms6sWLZS+0';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function refreshFailureEventType(session: { revokedAt: Date | null; expiresAt: Date; user: { isActive: boolean } }): 'ACCOUNT_INACTIVE' | 'SESSION_EXPIRED' | 'REFRESH_REUSE' {
  if (!session.user.isActive) return 'ACCOUNT_INACTIVE';
  if (session.expiresAt <= new Date()) return 'SESSION_EXPIRED';
  return 'REFRESH_REUSE';
}

export function parseRefreshToken(token: string): { sessionId: string; secret: string } | undefined {
  const [sessionId, secret, extra] = token.split('.');
  if (!sessionId || !secret || extra || !UUID_V4.test(sessionId)) return undefined;
  return { sessionId, secret };
}

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly audit: AuditService) {}

  async access(user: { id: string; email: string; role: string }, sessionId: string) {
    return this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role, sid: sessionId }, { secret: accessTokenSecret(), expiresIn: (process.env.JWT_ACCESS_TTL || '15m') as never });
  }

  async authenticate(email: string, password: string) {
    const user = await this.users.byEmail(email);
    const passwordMatches = await this.users.verify({ passwordHash: user?.passwordHash ?? DUMMY_PASSWORD_HASH }, password);
    if (!user || !user.isActive || !passwordMatches) {
      await this.audit.log('LOGIN', AuditResult.FAILURE, user?.id);
      throw new UnauthorizedException('Invalid credentials');
    }
    const session = await this.prisma.$transaction(async (tx) => {
      const created = await this.createSession(tx, user.id);
      await this.audit.logWith(tx, 'LOGIN', AuditResult.SUCCESS, user.id, created.id);
      return created;
    });
    return { user, session };
  }

  async register(email: string, password: string) {
    try {
      if (await this.users.byEmail(email)) throw new ConflictException('Unable to register');
      return await this.prisma.$transaction(async (tx) => {
        const user = await this.users.createWith(tx, email, password);
        const session = await this.createSession(tx, user.id);
        await this.audit.logWith(tx, 'REGISTER', AuditResult.SUCCESS, user.id, session.id);
        return { user, session };
      });
    } catch (error) {
      if (error instanceof ConflictException || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw new ConflictException('Unable to register');
      throw error;
    }
  }

  async refresh(token: string) {
    const parsed = parseRefreshToken(token);
    if (!parsed) return this.rejectRefresh();
    const result = await this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({ where: { id: parsed.sessionId }, include: { user: true } });
      if (!session || !(await argon2.verify(session.refreshTokenHash, parsed.secret))) return undefined;
      if (session.revokedAt || session.expiresAt <= new Date() || !session.user.isActive) {
        await tx.session.updateMany({ where: { familyId: session.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
        await this.audit.logWith(tx, refreshFailureEventType(session), AuditResult.FAILURE, session.userId, session.id);
        throw new UnauthorizedException('Invalid session');
      }
      const revoked = await tx.session.updateMany({ where: { id: session.id, revokedAt: null, expiresAt: { gt: new Date() } }, data: { revokedAt: new Date() } });
      if (revoked.count !== 1) {
        await tx.session.updateMany({ where: { familyId: session.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
        await this.audit.logWith(tx, 'REFRESH_REUSE', AuditResult.FAILURE, session.userId, session.id);
        throw new UnauthorizedException('Invalid session');
      }
      const next = await this.createSession(tx, session.userId, session.familyId);
      await this.audit.logWith(tx, 'REFRESH', AuditResult.SUCCESS, session.userId, next.id);
      return { user: session.user, session: next };
    });
    return result ?? this.rejectRefresh();
  }

  async logout(token?: string) {
    const parsed = token ? parseRefreshToken(token) : undefined;
    if (!parsed) return;
    await this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({ where: { id: parsed.sessionId } });
      if (!session || !(await argon2.verify(session.refreshTokenHash, parsed.secret))) return;
      const revoked = await tx.session.updateMany({ where: { id: session.id, revokedAt: null }, data: { revokedAt: new Date() } });
      if (revoked.count === 1) await this.audit.logWith(tx, 'LOGOUT', AuditResult.SUCCESS, session.userId, session.id);
    });
  }

  private async createSession(client: Prisma.TransactionClient, userId: string, familyId: string = randomUUID()) {
    const id = randomUUID();
    const secret = randomUUID() + randomUUID();
    const session = await client.session.create({ data: { id, userId, familyId, refreshTokenHash: await argon2.hash(secret), expiresAt: new Date(Date.now() + ttlDays() * 86400000) } });
    return { ...session, token: `${id}.${secret}` };
  }

  private async rejectRefresh(): Promise<never> {
    await this.audit.log('REFRESH', AuditResult.FAILURE);
    throw new UnauthorizedException('Invalid session');
  }
}
