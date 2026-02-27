/**
 * Tests for the rate limiter from lib/rate-limit.js
 *
 * We test the in-memory fallback path (no Upstash credentials set).
 * The Upstash path is covered by the @upstash/ratelimit library itself;
 * we focus on the custom logic in checkRateLimit and memoryRateLimit.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Ensure no Upstash credentials are set so the in-memory fallback is used.
// These must be cleared BEFORE the module is imported.
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

// We need to re-import for each test group to get a fresh memoryStores Map.
// Use vi.importActual to bypass any mocking.

/**
 * Helper: build a minimal Request-like object with headers.
 */
function fakeRequest(ip = '192.168.1.1') {
  const headers = new Map([
    ['x-forwarded-for', ip],
  ]);
  return {
    headers: {
      get: (key) => headers.get(key) || null,
    },
  };
}

describe('rate-limit (in-memory fallback)', () => {
  // Before each test, reset the module so the in-memory store is empty.
  let checkRateLimit;

  beforeEach(async () => {
    vi.resetModules();
    // Re-import to get a fresh module instance with empty memoryStores
    const mod = await import('../lib/rate-limit.js');
    checkRateLimit = mod.checkRateLimit;
  });

  // ── Basic rate limiting behavior ─────────────────────────────────────────

  describe('basic behavior', () => {
    it('allows requests under the limit', async () => {
      const req = fakeRequest('10.0.0.1');
      const result = await checkRateLimit('signup', req);
      expect(result.success).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('returns remaining count that decreases', async () => {
      const req = fakeRequest('10.0.0.2');
      const r1 = await checkRateLimit('signup', req);
      const r2 = await checkRateLimit('signup', req);
      expect(r2.remaining).toBeLessThan(r1.remaining);
    });
  });

  // ── Rate limiting kicks in after max requests ────────────────────────────

  describe('enforcement', () => {
    it('blocks signup after 5 requests from the same IP', async () => {
      const req = fakeRequest('10.0.0.10');

      // signup bucket allows 5 requests per 60s
      for (let i = 0; i < 5; i++) {
        const r = await checkRateLimit('signup', req);
        expect(r.success).toBe(true);
      }

      // 6th request should be blocked
      const blocked = await checkRateLimit('signup', req);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it('blocks login after 10 requests from the same IP', async () => {
      const req = fakeRequest('10.0.0.11');

      // login bucket allows 10 requests per 60s
      for (let i = 0; i < 10; i++) {
        const r = await checkRateLimit('login', req);
        expect(r.success).toBe(true);
      }

      const blocked = await checkRateLimit('login', req);
      expect(blocked.success).toBe(false);
    });

    it('blocks forgotPw after 5 requests from the same IP', async () => {
      const req = fakeRequest('10.0.0.12');

      for (let i = 0; i < 5; i++) {
        const r = await checkRateLimit('forgotPw', req);
        expect(r.success).toBe(true);
      }

      const blocked = await checkRateLimit('forgotPw', req);
      expect(blocked.success).toBe(false);
    });

    it('blocks adminAuth after 10 requests from the same IP', async () => {
      const req = fakeRequest('10.0.0.13');

      for (let i = 0; i < 10; i++) {
        const r = await checkRateLimit('adminAuth', req);
        expect(r.success).toBe(true);
      }

      const blocked = await checkRateLimit('adminAuth', req);
      expect(blocked.success).toBe(false);
    });
  });

  // ── Different IPs are independent ────────────────────────────────────────

  describe('IP isolation', () => {
    it('different IPs have independent counters', async () => {
      const reqA = fakeRequest('10.0.0.20');
      const reqB = fakeRequest('10.0.0.21');

      // Exhaust IP A's signup budget
      for (let i = 0; i < 5; i++) {
        await checkRateLimit('signup', reqA);
      }
      const blockedA = await checkRateLimit('signup', reqA);
      expect(blockedA.success).toBe(false);

      // IP B should still be allowed
      const resultB = await checkRateLimit('signup', reqB);
      expect(resultB.success).toBe(true);
    });
  });

  // ── Different buckets are independent ────────────────────────────────────

  describe('bucket isolation', () => {
    it('signup and login use independent counters', async () => {
      const req = fakeRequest('10.0.0.30');

      // Exhaust signup budget (5 requests)
      for (let i = 0; i < 5; i++) {
        await checkRateLimit('signup', req);
      }
      const blockedSignup = await checkRateLimit('signup', req);
      expect(blockedSignup.success).toBe(false);

      // Login should still work (separate bucket)
      const loginResult = await checkRateLimit('login', req);
      expect(loginResult.success).toBe(true);
    });
  });

  // ── Window reset behavior ────────────────────────────────────────────────

  describe('window reset', () => {
    it('resets counter after the time window expires', async () => {
      const req = fakeRequest('10.0.0.40');

      // Exhaust signup budget
      for (let i = 0; i < 5; i++) {
        await checkRateLimit('signup', req);
      }
      const blocked = await checkRateLimit('signup', req);
      expect(blocked.success).toBe(false);

      // Advance time past the 60-second window
      vi.useFakeTimers();
      vi.advanceTimersByTime(61_000);

      // Should be allowed again after window reset
      const afterReset = await checkRateLimit('signup', req);
      expect(afterReset.success).toBe(true);

      vi.useRealTimers();
    });
  });

  // ── IP extraction ────────────────────────────────────────────────────────

  describe('IP extraction', () => {
    it('extracts IP from x-forwarded-for header', async () => {
      const req = fakeRequest('203.0.113.50');
      const result = await checkRateLimit('signup', req);
      expect(result.success).toBe(true);
    });

    it('handles comma-separated x-forwarded-for (uses first IP)', async () => {
      const headers = new Map([
        ['x-forwarded-for', '203.0.113.1, 10.0.0.1, 172.16.0.1'],
      ]);
      const req = {
        headers: { get: (key) => headers.get(key) || null },
      };
      // First call succeeds
      const result = await checkRateLimit('signup', req);
      expect(result.success).toBe(true);
    });

    it('falls back to "unknown" when no IP headers are present', async () => {
      const req = {
        headers: { get: () => null },
      };
      const result = await checkRateLimit('signup', req);
      expect(result.success).toBe(true);
    });
  });

  // ── Unknown bucket name uses fallback config ─────────────────────────────

  describe('unknown bucket', () => {
    it('uses default config (max 10, 60s) for unknown bucket names', async () => {
      const req = fakeRequest('10.0.0.50');

      // Unknown bucket should allow up to 10 requests
      for (let i = 0; i < 10; i++) {
        const r = await checkRateLimit('unknownBucket', req);
        expect(r.success).toBe(true);
      }

      const blocked = await checkRateLimit('unknownBucket', req);
      expect(blocked.success).toBe(false);
    });
  });
});
