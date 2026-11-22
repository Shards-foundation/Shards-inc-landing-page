import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

function cspFor(env: string): string {
  vi.stubEnv('NODE_ENV', env);
  return proxy(new NextRequest('https://www.shardsinc.co.uk/')).headers.get('Content-Security-Policy') ?? '';
}

afterEach(() => vi.unstubAllEnvs());

describe('content security policy', () => {
  it('allows eval only outside production', () => {
    expect(cspFor('development')).toContain("'unsafe-eval'");
    expect(cspFor('production')).not.toContain("'unsafe-eval'");
  });

  it('issues a fresh nonce per request and keeps production locked down', () => {
    const a = cspFor('production');
    const b = cspFor('production');
    expect(a).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
    expect(a).not.toBe(b);
    expect(a).toContain("object-src 'none'");
    expect(a).toContain("frame-ancestors 'none'");
  });
});
