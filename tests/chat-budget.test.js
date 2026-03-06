/**
 * Tests for the chat budget guardrails from lib/chat-budget.js
 *
 * Tests the in-memory fallback path (no Upstash credentials).
 * Covers daily IP limits, monthly budget caps, and fingerprint abuse detection.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Ensure no Upstash credentials so in-memory fallback is used
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Helper: build a minimal Request-like object
 */
function fakeRequest(ip = '10.0.0.1', ua = 'TestAgent/1.0') {
  const headers = new Map([
    ['x-forwarded-for', ip],
    ['user-agent', ua],
    ['accept-language', 'en-US'],
    ['accept', 'text/html'],
  ]);
  return {
    headers: { get: (key) => headers.get(key) || null },
  };
}

describe('chat-budget (in-memory fallback)', () => {
  let checkChatBudget;
  let trackChatUsage;
  let getBudgetStatus;

  beforeEach(async () => {
    vi.resetModules();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const mod = await import('../lib/chat-budget.js');
    checkChatBudget = mod.checkChatBudget;
    trackChatUsage = mod.trackChatUsage;
    getBudgetStatus = mod.getBudgetStatus;
  });

  // ── Basic allow/deny ──────────────────────────────────────────────────────

  describe('basic behavior', () => {
    it('allows the first request from a new IP', async () => {
      const req = fakeRequest('10.0.0.100');
      const result = await checkChatBudget(req);
      expect(result.allowed).toBe(true);
    });

    it('returns an object with allowed property', async () => {
      const req = fakeRequest('10.0.0.101');
      const result = await checkChatBudget(req);
      expect(result).toHaveProperty('allowed');
      expect(typeof result.allowed).toBe('boolean');
    });
  });

  // ── Daily IP limit ────────────────────────────────────────────────────────

  describe('daily IP limit', () => {
    it('blocks after exceeding the daily IP limit (default 20)', async () => {
      const req = fakeRequest('10.0.0.200');

      // Track 20 requests
      for (let i = 0; i < 20; i++) {
        const check = await checkChatBudget(req);
        expect(check.allowed).toBe(true);
        await trackChatUsage(req);
      }

      // 21st should be blocked
      const blocked = await checkChatBudget(req);
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toBe('daily-ip');
      expect(typeof blocked.message).toBe('string');
    });

    it('different IPs have independent daily limits', async () => {
      const reqA = fakeRequest('10.0.0.201');
      const reqB = fakeRequest('10.0.0.202');

      // Exhaust IP A
      for (let i = 0; i < 20; i++) {
        await trackChatUsage(reqA);
      }
      const blockedA = await checkChatBudget(reqA);
      expect(blockedA.allowed).toBe(false);

      // IP B should still be allowed
      const resultB = await checkChatBudget(reqB);
      expect(resultB.allowed).toBe(true);
    });
  });

  // ── Fingerprint abuse detection ───────────────────────────────────────────

  describe('fingerprint abuse detection', () => {
    it('blocks same browser fingerprint after 30 requests across different IPs', async () => {
      // Same user-agent string = same fingerprint
      const ua = 'AbuseBot/1.0';

      for (let i = 0; i < 30; i++) {
        const req = fakeRequest(`10.0.${i}.1`, ua);
        await trackChatUsage(req);
      }

      // Next request with same fingerprint should be blocked
      const req = fakeRequest('10.0.99.1', ua);
      const result = await checkChatBudget(req);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('abuse');
    });

    it('different user-agents produce different fingerprints', async () => {
      // Exhaust fingerprint for UA-A
      for (let i = 0; i < 30; i++) {
        const req = fakeRequest(`10.1.${i}.1`, 'UA-A');
        await trackChatUsage(req);
      }

      // UA-B should still be allowed
      const req = fakeRequest('10.1.50.1', 'UA-B');
      const result = await checkChatBudget(req);
      expect(result.allowed).toBe(true);
    });
  });

  // ── Budget status reporting ───────────────────────────────────────────────

  describe('getBudgetStatus', () => {
    it('returns budget information', async () => {
      const status = await getBudgetStatus();
      expect(status).toHaveProperty('month');
      expect(status).toHaveProperty('spent');
      expect(status).toHaveProperty('budget');
      expect(status).toHaveProperty('remaining');
      expect(status).toHaveProperty('percentUsed');
      expect(status).toHaveProperty('requestsUsed');
      expect(status).toHaveProperty('requestsBudget');
    });

    it('month format is YYYY-MM', () => {
      const status = getBudgetStatus();
      // getBudgetStatus is async, but falls through sync for in-memory
      return status.then(s => {
        expect(s.month).toMatch(/^\d{4}-\d{2}$/);
      });
    });

    it('spent increases after tracking usage', async () => {
      const before = await getBudgetStatus();
      const beforeUsed = before.requestsUsed;

      // Track a few requests
      for (let i = 0; i < 5; i++) {
        const req = fakeRequest(`10.2.0.${i}`);
        await trackChatUsage(req);
      }

      const after = await getBudgetStatus();
      expect(after.requestsUsed).toBeGreaterThan(beforeUsed);
    });

    it('dollar values are formatted with $ prefix', async () => {
      const status = await getBudgetStatus();
      expect(status.spent).toMatch(/^\$/);
      expect(status.budget).toMatch(/^\$/);
      expect(status.remaining).toMatch(/^\$/);
    });
  });

  // ── Denied response structure ─────────────────────────────────────────────

  describe('denied response structure', () => {
    it('includes reason and message when denied', async () => {
      const req = fakeRequest('10.3.0.1');
      for (let i = 0; i < 20; i++) {
        await trackChatUsage(req);
      }
      const result = await checkChatBudget(req);
      expect(result.allowed).toBe(false);
      expect(typeof result.reason).toBe('string');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
    });

    it('does not include reason/message when allowed', async () => {
      const req = fakeRequest('10.3.0.2');
      const result = await checkChatBudget(req);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
      expect(result.message).toBeUndefined();
    });
  });
});
