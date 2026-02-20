import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

const RELAY_URL = process.env.RELAY_URL || 'https://tally-production-cde2.up.railway.app';
const RELAY_KEY = process.env.RELAY_ADMIN_KEY || process.env.ADMIN_API_KEY;
const SESSION_SECRET = process.env.SESSION_SECRET;

const ALLOWED_PATH_PREFIXES = [
  '/api/health',
  '/api/churches',
  '/api/events',
  '/api/resellers',
  '/api/reseller',
  '/api/billing',
  '/api/command',
  '/api/broadcast',
  '/api/alerts',
  '/api/digest',
  '/api/planning-center',
  '/api/maintenance',
  '/api/oncall',
  '/api/guest-token',
  '/api/guest-tokens',
  '/api/telegram-webhook',
  '/api/slack',
  '/api/dashboard',
  '/api/bot',
];

function safePath(pathname) {
  if (!pathname || !pathname.startsWith('/')) return null;
  if (pathname.includes('..')) return null;
  if (/[\r\n\s]/.test(pathname)) return null;
  if (!pathname.startsWith('/api/')) return null;

  const normalized = pathname.replace(/\/+/, '/');
  const allowed = ALLOWED_PATH_PREFIXES.some(
    prefix => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
  return allowed ? normalized : null;
}

function verifyToken(req) {
  if (!SESSION_SECRET) return false;

  const auth = req.headers.get('x-admin-token') || '';
  if (!auth) return false;

  try {
    const decoded = Buffer.from(auth, 'base64').toString('utf-8');

    // Backward-compatible with older session format: base64("ts:SESSION_SECRET").
    const parts = decoded.split(':');
    if (parts.length === 2 && parts[1] === SESSION_SECRET) return true;

    const [ts, nonce, sig, ttlMs = '28800000'] = parts;
    const tsNum = Number(ts);
    const ttl = Number(ttlMs);

    if (!Number.isFinite(tsNum) || !Number.isFinite(ttl) || !nonce || !sig) return false;

    const now = Date.now();
    if (now - tsNum > ttl) return false;

    const expected = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`${ts}:${nonce}`)
      .digest('hex');

    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function proxyRequest(req, method) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const upstreamPath = safePath(searchParams.get('path') || '/api/health');
  if (!upstreamPath) {
    return NextResponse.json({ error: 'Invalid relay path' }, { status: 400 });
  }

  if (!RELAY_URL || !RELAY_KEY) {
    return NextResponse.json({ error: 'Relay credentials not configured' }, { status: 500 });
  }

  let body;
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      body = await req.text();
    } catch {}
  }

  const upstream = await fetch(`${RELAY_URL}${upstreamPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': RELAY_KEY,
    },
    ...(body ? { body } : {}),
  });

  const data = await upstream.text();
  try {
    return NextResponse.json(JSON.parse(data), { status: upstream.status });
  } catch {
    return new NextResponse(data, { status: upstream.status });
  }
}

export async function GET(req) { return proxyRequest(req, 'GET'); }
export async function POST(req) { return proxyRequest(req, 'POST'); }
export async function PUT(req) { return proxyRequest(req, 'PUT'); }
export async function DELETE(req) { return proxyRequest(req, 'DELETE'); }
