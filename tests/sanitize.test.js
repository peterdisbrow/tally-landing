/**
 * Tests for the sanitizePayload function from app/api/church/onboard/route.js
 *
 * Since sanitizePayload is not exported (it's a module-private function),
 * we replicate its logic here and test the exact same algorithm.
 * If the implementation changes, these tests serve as a specification
 * that the new implementation should also satisfy.
 */

import { describe, it, expect } from 'vitest';

// ── Replicate the allowlists from the route ──────────────────────────────────

const ALLOWED_TIERS = new Set(['connect', 'plus', 'pro', 'managed', 'event']);
const ALLOWED_BILLING_INTERVALS = new Set(['monthly', 'annual']);

// ── Exact copy of sanitizePayload from route.js ──────────────────────────────

function sanitizePayload(body = {}) {
  const tier = ALLOWED_TIERS.has(body.tier) ? body.tier : 'connect';
  const intervalInput = String(body.billingInterval || body.billingCycle || '').trim().toLowerCase();
  const billingInterval = ALLOWED_BILLING_INTERVALS.has(intervalInput)
    ? intervalInput
    : 'monthly';

  const result = {
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim(),
    password: String(body.password || ''),
    tier,
    billingInterval,
    tosAccepted: body.tosAccepted === true,
    privacyAccepted: body.privacyAccepted === true,
    tosAcceptedAt: body.tosAcceptedAt || new Date().toISOString(),
  };

  // Pass through referral code if present
  const ref = String(body.referralCode || '').trim().toUpperCase();
  if (ref) result.referralCode = ref;

  return result;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('sanitizePayload', () => {
  // ── Tier validation ──────────────────────────────────────────────────────

  describe('tier validation', () => {
    it('accepts all valid tiers', () => {
      for (const tier of ['connect', 'plus', 'pro', 'managed', 'event']) {
        const result = sanitizePayload({ tier });
        expect(result.tier).toBe(tier);
      }
    });

    it('defaults to "connect" for an invalid tier', () => {
      const result = sanitizePayload({ tier: 'enterprise' });
      expect(result.tier).toBe('connect');
    });

    it('defaults to "connect" when tier is missing', () => {
      const result = sanitizePayload({});
      expect(result.tier).toBe('connect');
    });

    it('defaults to "connect" for null tier', () => {
      const result = sanitizePayload({ tier: null });
      expect(result.tier).toBe('connect');
    });

    it('defaults to "connect" for numeric tier', () => {
      const result = sanitizePayload({ tier: 123 });
      expect(result.tier).toBe('connect');
    });

    it('is case-sensitive — "Pro" is not "pro"', () => {
      const result = sanitizePayload({ tier: 'Pro' });
      expect(result.tier).toBe('connect');
    });
  });

  // ── Billing interval validation ──────────────────────────────────────────

  describe('billing interval validation', () => {
    it('accepts "monthly"', () => {
      const result = sanitizePayload({ billingInterval: 'monthly' });
      expect(result.billingInterval).toBe('monthly');
    });

    it('accepts "annual"', () => {
      const result = sanitizePayload({ billingInterval: 'annual' });
      expect(result.billingInterval).toBe('annual');
    });

    it('defaults to "monthly" for invalid interval', () => {
      const result = sanitizePayload({ billingInterval: 'weekly' });
      expect(result.billingInterval).toBe('monthly');
    });

    it('defaults to "monthly" when interval is missing', () => {
      const result = sanitizePayload({});
      expect(result.billingInterval).toBe('monthly');
    });

    it('accepts billingCycle as fallback field name', () => {
      const result = sanitizePayload({ billingCycle: 'annual' });
      expect(result.billingInterval).toBe('annual');
    });

    it('trims and lowercases the interval', () => {
      const result = sanitizePayload({ billingInterval: '  Annual  ' });
      expect(result.billingInterval).toBe('annual');
    });

    it('prefers billingInterval over billingCycle', () => {
      const result = sanitizePayload({
        billingInterval: 'annual',
        billingCycle: 'monthly',
      });
      expect(result.billingInterval).toBe('annual');
    });
  });

  // ── Name / email / password trimming and coercion ────────────────────────

  describe('string field trimming and coercion', () => {
    it('trims whitespace from name and email', () => {
      const result = sanitizePayload({
        name: '  Grace Church  ',
        email: '  admin@grace.org  ',
        password: 'secret123',
      });
      expect(result.name).toBe('Grace Church');
      expect(result.email).toBe('admin@grace.org');
    });

    it('does NOT trim password (preserves leading/trailing spaces)', () => {
      const result = sanitizePayload({ password: ' s3cret ' });
      expect(result.password).toBe(' s3cret ');
    });

    it('coerces non-string name/email to string via String()', () => {
      const result = sanitizePayload({ name: 42, email: true });
      expect(result.name).toBe('42');
      expect(result.email).toBe('true');
    });

    it('returns empty strings for missing fields', () => {
      const result = sanitizePayload({});
      expect(result.name).toBe('');
      expect(result.email).toBe('');
      expect(result.password).toBe('');
    });

    it('returns empty strings for null fields', () => {
      const result = sanitizePayload({ name: null, email: null, password: null });
      expect(result.name).toBe('');
      expect(result.email).toBe('');
      expect(result.password).toBe('');
    });
  });

  // ── Boolean fields ───────────────────────────────────────────────────────

  describe('boolean fields', () => {
    it('tosAccepted is true only for literal true', () => {
      expect(sanitizePayload({ tosAccepted: true }).tosAccepted).toBe(true);
      expect(sanitizePayload({ tosAccepted: 'true' }).tosAccepted).toBe(false);
      expect(sanitizePayload({ tosAccepted: 1 }).tosAccepted).toBe(false);
      expect(sanitizePayload({}).tosAccepted).toBe(false);
    });

    it('privacyAccepted is true only for literal true', () => {
      expect(sanitizePayload({ privacyAccepted: true }).privacyAccepted).toBe(true);
      expect(sanitizePayload({ privacyAccepted: 'yes' }).privacyAccepted).toBe(false);
    });
  });

  // ── Referral code handling ───────────────────────────────────────────────

  describe('referral code handling', () => {
    it('uppercases and trims the referral code', () => {
      const result = sanitizePayload({ referralCode: '  abc123  ' });
      expect(result.referralCode).toBe('ABC123');
    });

    it('omits referralCode when empty string is provided', () => {
      const result = sanitizePayload({ referralCode: '' });
      expect(result).not.toHaveProperty('referralCode');
    });

    it('omits referralCode when not provided at all', () => {
      const result = sanitizePayload({});
      expect(result).not.toHaveProperty('referralCode');
    });

    it('omits referralCode when null', () => {
      const result = sanitizePayload({ referralCode: null });
      expect(result).not.toHaveProperty('referralCode');
    });

    it('includes referralCode when a valid code is provided', () => {
      const result = sanitizePayload({ referralCode: 'PARTNER2025' });
      expect(result.referralCode).toBe('PARTNER2025');
    });
  });

  // ── XSS payload sanitization ─────────────────────────────────────────────

  describe('XSS payload sanitization', () => {
    it('does not strip HTML from name (String coercion only) — downstream must escape', () => {
      // sanitizePayload uses String() + trim(), so HTML passes through as a string.
      // This test documents that behavior — output encoding must happen at render time.
      const result = sanitizePayload({ name: '<script>alert("xss")</script>' });
      expect(result.name).toBe('<script>alert("xss")</script>');
      // The key protection is that tier/billingInterval are allowlisted,
      // and the data flows into JSON (not raw HTML), so XSS in name/email
      // is neutralized by the JSON response format + downstream escaping.
      expect(typeof result.name).toBe('string');
    });

    it('XSS in tier is rejected — falls back to "connect"', () => {
      const result = sanitizePayload({ tier: '<img src=x onerror=alert(1)>' });
      expect(result.tier).toBe('connect');
    });

    it('XSS in billingInterval is rejected — falls back to "monthly"', () => {
      const result = sanitizePayload({ billingInterval: '"><script>alert(1)</script>' });
      expect(result.billingInterval).toBe('monthly');
    });

    it('XSS in referralCode is uppercased, not executed', () => {
      const result = sanitizePayload({ referralCode: '<script>alert(1)</script>' });
      // The code is uppercased and passed as a JSON string — never rendered as HTML
      expect(result.referralCode).toBe('<SCRIPT>ALERT(1)</SCRIPT>');
      expect(typeof result.referralCode).toBe('string');
    });

    it('prototype pollution attempt has no effect on output', () => {
      const malicious = JSON.parse('{"__proto__":{"admin":true},"name":"test"}');
      const result = sanitizePayload(malicious);
      expect(result.name).toBe('test');
      expect(result.admin).toBeUndefined();
    });
  });

  // ── Edge: empty / undefined body ─────────────────────────────────────────

  describe('edge cases', () => {
    it('handles undefined body via default parameter', () => {
      const result = sanitizePayload();
      expect(result.tier).toBe('connect');
      expect(result.billingInterval).toBe('monthly');
      expect(result.name).toBe('');
    });

    it('handles empty object', () => {
      const result = sanitizePayload({});
      expect(result.tier).toBe('connect');
      expect(result.billingInterval).toBe('monthly');
    });

    it('preserves tosAcceptedAt when provided', () => {
      const ts = '2025-01-15T12:00:00.000Z';
      const result = sanitizePayload({ tosAcceptedAt: ts });
      expect(result.tosAcceptedAt).toBe(ts);
    });

    it('generates tosAcceptedAt as ISO string when not provided', () => {
      const before = new Date().toISOString();
      const result = sanitizePayload({});
      const after = new Date().toISOString();
      // The generated timestamp should be between before and after
      expect(result.tosAcceptedAt >= before).toBe(true);
      expect(result.tosAcceptedAt <= after).toBe(true);
    });

    it('does not leak extra fields from the input body', () => {
      const result = sanitizePayload({
        name: 'Test',
        email: 'a@b.com',
        password: 'pw',
        maliciousField: 'DROP TABLE churches',
        anotherField: { nested: true },
      });
      expect(result).not.toHaveProperty('maliciousField');
      expect(result).not.toHaveProperty('anotherField');
    });
  });
});
