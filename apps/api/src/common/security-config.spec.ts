import { describe, expect, it } from 'vitest';
import { accessTokenSecret, assertSameSiteRefreshTopology, webOrigin } from './security-config';
import { requireOwnership } from './ownership';

const restore = (key: string, value: string | undefined) => {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
};

describe('security boundaries', () => {
  it('rejects absent JWT secret', () => {
    const previous = process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_ACCESS_SECRET;
    expect(accessTokenSecret).toThrow();
    restore('JWT_ACCESS_SECRET', previous);
  });

  it('rejects absent or malformed WEB_ORIGIN', () => {
    const previous = process.env.WEB_ORIGIN;
    delete process.env.WEB_ORIGIN;
    expect(webOrigin).toThrow();
    process.env.WEB_ORIGIN = 'not-an-origin';
    expect(webOrigin).toThrow();
    restore('WEB_ORIGIN', previous);
  });

  it('accepts an exact HTTP origin', () => {
    const previous = process.env.WEB_ORIGIN;
    process.env.WEB_ORIGIN = 'https://app.example.com';
    expect(webOrigin()).toBe('https://app.example.com');
    restore('WEB_ORIGIN', previous);
  });

  it('rejects a cross-site refresh cookie topology', () => {
    const web = process.env.WEB_ORIGIN;
    const api = process.env.API_PUBLIC_ORIGIN;
    process.env.WEB_ORIGIN = 'https://app.example.com';
    process.env.API_PUBLIC_ORIGIN = 'https://api.example.net';
    expect(assertSameSiteRefreshTopology).toThrow();
    restore('WEB_ORIGIN', web);
    restore('API_PUBLIC_ORIGIN', api);
  });

  it('requires ownership', () => expect(() => requireOwnership('a', 'b')).toThrow());
});
