import * as argon2 from 'argon2';
import { Role } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../src/auth/auth.service';

const sessionId = 'a7ed793e-cf8b-4f9e-9c16-4c0d4200a39a';
const secret = 'session-secret';

async function serviceFor(updateCounts: number[]) {
  const session = {
    id: sessionId, userId: 'user-1', familyId: 'family-1', refreshTokenHash: await argon2.hash(secret), expiresAt: new Date(Date.now() + 60000), revokedAt: null,
    user: { id: 'user-1', email: 'teacher@example.com', role: Role.PROFESSOR, isActive: true },
  };
  const prisma = { session: { findUnique: vi.fn().mockResolvedValue(session), updateMany: vi.fn().mockImplementation(() => Promise.resolve({ count: updateCounts.shift() ?? 0 })), create: vi.fn().mockResolvedValue({ ...session, id: 'b7ed793e-cf8b-4f9e-9c16-4c0d4200a39a' }) } };
  Object.assign(prisma, { $transaction: async (operation: (client: typeof prisma) => unknown) => operation(prisma) });
  const audit = { log: vi.fn().mockResolvedValue(undefined), logWith: vi.fn().mockResolvedValue(undefined) };
  return { service: new AuthService({} as never, prisma as never, {} as never, audit as never), prisma, audit };
}

describe('refresh rotation integration', () => {
  it('looks up one session and revokes it conditionally before issuing a replacement', async () => {
    const { service, prisma, audit } = await serviceFor([1]);
    await service.refresh(`${sessionId}.${secret}`);
    expect(prisma.session.findUnique).toHaveBeenCalledWith({ where: { id: sessionId }, include: { user: true } });
    expect(prisma.session.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: sessionId, revokedAt: null }) }));
    expect(audit.logWith).toHaveBeenCalledWith(prisma, 'REFRESH', 'SUCCESS', 'user-1', expect.any(String));
  });

  it('rejects a concurrent use that loses the conditional revocation', async () => {
    const { service, prisma, audit } = await serviceFor([0, 1]);
    await expect(service.refresh(`${sessionId}.${secret}`)).rejects.toThrow('Invalid session');
    expect(prisma.session.create).not.toHaveBeenCalled();
    expect(audit.logWith).toHaveBeenCalledWith(prisma, 'REFRESH_REUSE', 'FAILURE', 'user-1', sessionId);
  });
});
