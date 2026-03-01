/**
 * Chat budget guardrails — daily IP caps, global monthly budget kill switch,
 * and browser-fingerprint abuse detection.
 *
 * Uses Upstash Redis in production (persistent across deploys/cold starts),
 * falls back to in-memory Map for local development.
 *
 * Env vars:
 *   CHAT_MONTHLY_BUDGET  — monthly spend cap in dollars (default: 20)
 *   CHAT_DAILY_IP_LIMIT  — max AI requests per IP per day (default: 50)
 */

import { Redis } from '@upstash/redis';

// ─── Config (override via env) ───────────────────────────────────────────────
const MONTHLY_BUDGET_DOLLARS = Number(process.env.CHAT_MONTHLY_BUDGET) || 20;
const MONTHLY_BUDGET_CENTS = MONTHLY_BUDGET_DOLLARS * 100;
const DAILY_IP_LIMIT = Number(process.env.CHAT_DAILY_IP_LIMIT) || 50;
const EST_COST_PER_REQ_CENTS = 0.4; // ~$0.004 per request (3500 in + 150 out tokens)
const FINGERPRINT_DAILY_LIMIT = 75; // catches IP rotation — same browser signature

// ─── Redis ───────────────────────────────────────────────────────────────────
const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
let redis;
if (hasUpstash) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// ─── In-memory fallback (local dev) ──────────────────────────────────────────
const mem = new Map();

function memGet(key, ttlMs) {
  const e = mem.get(key);
  if (!e) return 0;
  if (Date.now() - e.start > ttlMs) { mem.delete(key); return 0; }
  return e.val;
}

function memAdd(key, amount, ttlMs) {
  const now = Date.now();
  const e = mem.get(key);
  if (e && now - e.start < ttlMs) {
    e.val += amount;
    return e.val;
  }
  mem.set(key, { val: amount, start: now });
  return amount;
}

// Cleanup stale entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, e] of mem) {
      if (now - e.start > 86_400_000) mem.delete(k);
    }
  }, 10 * 60_000);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getClientIp(req) {
  const fwd = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  return fwd ? fwd.split(',')[0].trim() : 'unknown';
}

function getFingerprint(req) {
  const ua = req.headers.get('user-agent') || '';
  const lang = req.headers.get('accept-language') || '';
  const accept = req.headers.get('accept') || '';
  let hash = 0;
  const str = `${ua}|${lang}|${accept}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

function monthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Check all budget guardrails BEFORE making an API call.
 * @returns {{ allowed: boolean, reason?: string, message?: string }}
 */
export async function checkChatBudget(req) {
  const ip = getClientIp(req);
  const fp = getFingerprint(req);
  const month = monthKey();

  if (redis) {
    const pipe = redis.pipeline();
    pipe.get(`tally:chat:budget:${month}`);
    pipe.get(`tally:chat:daily:${ip}`);
    pipe.get(`tally:chat:fp:${fp}`);
    const [budgetRaw, dailyRaw, fpRaw] = await pipe.exec();

    const spent = Number(budgetRaw) || 0;
    const daily = Number(dailyRaw) || 0;
    const fpCount = Number(fpRaw) || 0;

    if (spent >= MONTHLY_BUDGET_CENTS) {
      return { allowed: false, reason: 'budget', message: 'Chat is temporarily unavailable. Please email support@atemschool.com for help.' };
    }
    if (daily >= DAILY_IP_LIMIT) {
      return { allowed: false, reason: 'daily-ip', message: `You've reached the daily message limit (${DAILY_IP_LIMIT}). Come back tomorrow, or email sales@atemschool.com!` };
    }
    if (fpCount >= FINGERPRINT_DAILY_LIMIT) {
      return { allowed: false, reason: 'abuse', message: 'Too many messages today. Please try again tomorrow.' };
    }

    return { allowed: true };
  }

  // In-memory fallback
  const spent = memGet(`budget:${month}`, 33 * 86_400_000);
  const daily = memGet(`daily:${ip}`, 86_400_000);
  const fpCount = memGet(`fp:${fp}`, 86_400_000);

  if (spent >= MONTHLY_BUDGET_CENTS) {
    return { allowed: false, reason: 'budget', message: 'Chat is temporarily unavailable. Please email support@atemschool.com for help.' };
  }
  if (daily >= DAILY_IP_LIMIT) {
    return { allowed: false, reason: 'daily-ip', message: `You've reached the daily message limit (${DAILY_IP_LIMIT}). Come back tomorrow, or email sales@atemschool.com!` };
  }
  if (fpCount >= FINGERPRINT_DAILY_LIMIT) {
    return { allowed: false, reason: 'abuse', message: 'Too many messages today. Please try again tomorrow.' };
  }

  return { allowed: true };
}

/**
 * Increment all counters AFTER a successful API call begins.
 */
export async function trackChatUsage(req) {
  const ip = getClientIp(req);
  const fp = getFingerprint(req);
  const month = monthKey();

  if (redis) {
    const pipe = redis.pipeline();

    // Daily per-IP (24h TTL)
    const dKey = `tally:chat:daily:${ip}`;
    pipe.incr(dKey);
    pipe.expire(dKey, 86400);

    // Monthly budget in cents (33-day TTL)
    const bKey = `tally:chat:budget:${month}`;
    pipe.incrbyfloat(bKey, EST_COST_PER_REQ_CENTS);
    pipe.expire(bKey, 33 * 86400);

    // Fingerprint daily (24h TTL)
    const fKey = `tally:chat:fp:${fp}`;
    pipe.incr(fKey);
    pipe.expire(fKey, 86400);

    await pipe.exec();
    return;
  }

  // In-memory fallback
  memAdd(`daily:${ip}`, 1, 86_400_000);
  memAdd(`budget:${month}`, EST_COST_PER_REQ_CENTS, 33 * 86_400_000);
  memAdd(`fp:${fp}`, 1, 86_400_000);
}

/**
 * Get current budget status (for admin dashboard or debugging).
 */
export async function getBudgetStatus() {
  const month = monthKey();
  let spentCents = 0;

  if (redis) {
    spentCents = Number(await redis.get(`tally:chat:budget:${month}`)) || 0;
  } else {
    spentCents = memGet(`budget:${month}`, 33 * 86_400_000);
  }

  return {
    month,
    spent: `$${(spentCents / 100).toFixed(2)}`,
    budget: `$${MONTHLY_BUDGET_DOLLARS.toFixed(2)}`,
    remaining: `$${((MONTHLY_BUDGET_CENTS - spentCents) / 100).toFixed(2)}`,
    percentUsed: Math.round((spentCents / MONTHLY_BUDGET_CENTS) * 100),
    requestsUsed: Math.round(spentCents / EST_COST_PER_REQ_CENTS),
    requestsBudget: Math.round(MONTHLY_BUDGET_CENTS / EST_COST_PER_REQ_CENTS),
  };
}
