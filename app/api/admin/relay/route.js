import { NextResponse } from 'next/server';

const RELAY_URL = process.env.RELAY_URL || 'https://tally-production-cde2.up.railway.app';
const RELAY_KEY = process.env.RELAY_ADMIN_KEY || process.env.ADMIN_API_KEY;

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
  '/api/admin/me',
  '/api/admin/users',
];

function safePath(pathname) {
  if (!pathname || !pathname.startsWith('/')) return null;
  if (pathname.includes('..')) return null;
  if (/[\r\n\s]/.test(pathname)) return null;
  if (!pathname.startsWith('/api/')) return null;

  const normalized = pathname.replace(/\/+/g, '/');
  const allowed = ALLOWED_PATH_PREFIXES.some(
    prefix => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
  return allowed ? normalized : null;
}

/**
 * Proxy admin requests to the relay server.
 *
 * Auth: The client sends the JWT in the x-admin-token header.
 * We forward it to the relay as Authorization: Bearer <jwt>.
 * The relay validates the JWT and checks role permissions.
 *
 * Legacy fallback: If RELAY_KEY is set and the token doesn't look like a JWT,
 * fall back to x-api-key auth for backward compat.
 */
async function proxyRequest(req, method) {
  const token = req.headers.get('x-admin-token') || '';
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const upstreamPath = safePath(searchParams.get('path') || '/api/health');
  if (!upstreamPath) {
    return NextResponse.json({ error: 'Invalid relay path' }, { status: 400 });
  }

  if (!RELAY_URL) {
    return NextResponse.json({ error: 'Relay URL not configured' }, { status: 500 });
  }

  let body;
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      body = await req.text();
    } catch {}
  }

  // Determine auth strategy: JWT (3 dot-separated parts) or legacy API key
  const isJwt = token.split('.').length === 3;

  const headers = { 'Content-Type': 'application/json' };
  if (isJwt) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (RELAY_KEY) {
    headers['x-api-key'] = RELAY_KEY;
  } else {
    return NextResponse.json({ error: 'Relay credentials not configured' }, { status: 500 });
  }

  const upstream = await fetch(`${RELAY_URL}${upstreamPath}`, {
    method,
    headers,
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
