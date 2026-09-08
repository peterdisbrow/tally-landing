import { afterEach, describe, expect, it, vi } from 'vitest';

describe('GET /api/time', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('proxies Tally { serverTime, isoTime } when upstream is up', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      return new Response(JSON.stringify({
        serverTime: 1788910329927,
        isoTime: '2026-09-08T23:32:09.927Z',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));

    const { GET } = await import('../app/api/time/route.js');
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual({
      serverTime: 1788910329927,
      isoTime: '2026-09-08T23:32:09.927Z',
    });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('returns local server time when Tally is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network');
    }));

    const { GET } = await import('../app/api/time/route.js');
    const res = await GET();
    const body = await res.json();
    expect(typeof body.serverTime).toBe('number');
    expect(body.isoTime).toBe(new Date(body.serverTime).toISOString());
  });
});
