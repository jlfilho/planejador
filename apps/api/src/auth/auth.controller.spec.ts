import { afterEach, describe, expect, it } from 'vitest';
import { refreshCookieOptions } from './auth.controller';

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
});

describe('refresh cookie options', () => {
  it('uses a secure, HttpOnly cookie in production', () => {
    process.env.NODE_ENV = 'production';
    expect(refreshCookieOptions()).toMatchObject({ httpOnly: true, secure: true, sameSite: 'lax', path: '/api/v1/auth' });
  });

  it('keeps the cookie HttpOnly during local development', () => {
    process.env.NODE_ENV = 'development';
    expect(refreshCookieOptions()).toMatchObject({ httpOnly: true, secure: false, sameSite: 'lax', path: '/api/v1/auth' });
  });
});
