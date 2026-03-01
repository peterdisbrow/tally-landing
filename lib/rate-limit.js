/**
 * Persistent rate limiting — uses Upstash Redis in production (survives cold starts),
 * falls back to in-memory Map for local development.
 *
 * Setup: Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your env vars.
 * On Vercel, enable the Upstash Redis integration and these are set automatically.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// ─── Upstash-backed limiters (production) ────────────────────────────────────

let redis;
if (hasUpstash) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Create a named rate limiter.
 * @param {string} prefix - Namespace prefix (e.g. 'signup', 'login', 'admin-auth')
 * @param {number} maxRequests - Max requests allowed per window
 * @param {string} window - Sliding window duration (e.g. '60s', '15m', '1h')
 */
function createLimiter(prefix, maxRequests, window) {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, window),
      prefix: `tally:rl:${prefix}`,
      analytics: false,
    });
  }
  return null; // in-memory fallback handled below
}

// Pre-built limiters for each route
const limiters = {
  signup:     createLimiter('signup', 5, '60s'),
  login:      createLimiter('login', 10, '60s'),
  adminAuth:  createLimiter('admin-auth', 10, '60s'),
  forgotPw:   createLimiter('forgot-pw', 5, '60s'),
  resetPw:    createLimiter('reset-pw', 5, '60s'),
  chat:       createLimiter('chat', 20, '60s'),
};

// ─── In-memory fallback (local dev) ──────────────────────────────────────────

const memoryStores = new Map();

function memoryRateLimit(prefix, maxRequests, windowMs, key) {
  const storeKey = `${prefix}:${key}`;
  const now = Date.now();
  const entry = memoryStores.get(storeKey) || { count: 0, start: now };

  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }

  entry.count += 1;
  memoryStores.set(storeKey, entry);
  return { success: entry.count <= maxRequests, remaining: Math.max(0, maxRequests - entry.count) };
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStores) {
      if (now - entry.start > 300_000) memoryStores.delete(key);
    }
  }, 5 * 60_000);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Extract client IP from a Next.js request.
 */
function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

/**
 * Check rate limit for a named bucket.
 * @param {'signup'|'login'|'adminAuth'|'forgotPw'|'resetPw'|'chat'} name - Limiter name
 * @param {Request} req - Next.js request object
 * @returns {Promise<{ success: boolean, remaining: number }>}
 */
export async function checkRateLimit(name, req) {
  const ip = getClientIp(req);

  const limiter = limiters[name];
  if (limiter) {
    // Upstash — persistent across cold starts
    const result = await limiter.limit(ip);
    return { success: result.success, remaining: result.remaining };
  }

  // Fallback — in-memory for local dev
  const configs = {
    signup:    { max: 5,  windowMs: 60_000 },
    login:     { max: 10, windowMs: 60_000 },
    adminAuth: { max: 10, windowMs: 60_000 },
    forgotPw:  { max: 5,  windowMs: 60_000 },
    resetPw:   { max: 5,  windowMs: 60_000 },
    chat:      { max: 20, windowMs: 60_000 },
  };
  const cfg = configs[name] || { max: 10, windowMs: 60_000 };
  return memoryRateLimit(name, cfg.max, cfg.windowMs, ip);
}
