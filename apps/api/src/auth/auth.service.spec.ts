import { describe, expect, it } from 'vitest';
import { refreshFailureEventType } from './auth.service';

describe('refresh audit classification', () => {
  it('prioritizes inactive accounts over expired or revoked sessions', () => {
    expect(refreshFailureEventType({ revokedAt: new Date(), expiresAt: new Date(0), user: { isActive: false } })).toBe('ACCOUNT_INACTIVE');
  });

  it('classifies expired sessions distinctly', () => {
    expect(refreshFailureEventType({ revokedAt: null, expiresAt: new Date(0), user: { isActive: true } })).toBe('SESSION_EXPIRED');
  });

  it('classifies revoked sessions as refresh reuse', () => {
    expect(refreshFailureEventType({ revokedAt: new Date(), expiresAt: new Date(Date.now() + 60000), user: { isActive: true } })).toBe('REFRESH_REUSE');
  });
});
