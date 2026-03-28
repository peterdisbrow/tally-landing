import { NextResponse } from 'next/server';
import { RELAY_URL } from '../../../../lib/relay';
if (!RELAY_URL) {
  console.error('[admin/relay] RELAY_URL is not configured');
}

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
  '/api/admin/reviews',
  '/api/admin/ai-usage',
  '/api/admin/alerts',
  '/api/admin/tickets',
  '/api/admin/emails',
  '/api/support',
  '/api/chat',
  '/api/status',
  '/api/admin/streams',
  '/api/admin/stream',
  '/api/admin/church',
  '/api/admin/overview',
  '/api/admin/churches',
];

function getToken(req) {
  const headerToken = (req.headers.get('x-admin-token') || '').trim();
  if (headerToken) return headerToken;

  const cookieToken = req.cookies?.get?.('tally_admin_token')?.value;
  if (cookieToken && cookieToken.trim()) return cookieToken.trim();

  return '';
}

function isLikelyJwt(token) {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
}

function safePath(pathname) {
  if (!pathname || !pathname.startsWith('/')) return null;
  if (pathname.includes('..')) return null;
  if (/[\r\n\s]/.test(pathname)) return null;
  if (!pathname.startsWith('/api/')) return null;

  // Strip query string for prefix validation, but preserve it for upstream
  const [pathOnly, ...qsParts] = pathname.split('?');
  const normalized = pathOnly.replace(/\/+$/g, '').replace(/\/+/, '/');
  const allowed = ALLOWED_PATH_PREFIXES.some(
    prefix => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
  if (!allowed) return null;
  // Return path with query string intact
  const qs = qsParts.length ? `?${qsParts.join('?')}` : '';
  return `${normalized}${qs}`;
}

function parseJsonText(text, status) {
  try {
    return [JSON.parse(text), 'json'];
  } catch {
    return [{ error: text || 'Upstream returned non-JSON response' }, 'fallback'];
  }
}

function badRequest(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Proxy admin requests to the relay server.
 *
 * Auth: client sends the admin JWT in x-admin-token or in HttpOnly cookie `tally_admin_token`.
 * Only valid JWT-shaped tokens are accepted.
 */
async function proxyRequest(req, method) {
  if (!RELAY_URL) {
    return badRequest('Relay URL not configured', 500);
  }

  const token = getToken(req);
  if (!token || !isLikelyJwt(token)) {
    return badRequest('Unauthorized', 401);
  }

  const { searchParams } = new URL(req.url);
  const upstreamPath = safePath(searchParams.get('path') || '/api/health');
  if (!upstreamPath) {
    return badRequest('Invalid relay path');
  }

  let body;
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  const upstream = await fetch(`${RELAY_URL}${upstreamPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body } : {}),
  });

  // Pass through HLS content (m3u8 playlists and .ts segments) as raw binary
  const contentType = upstream.headers.get('content-type') || '';
  if (contentType.includes('mpegurl')) {
    // Rewrite m3u8 playlist: replace relative segment filenames with absolute proxy URLs
    let m3u8 = await upstream.text();
    const pathDir = upstreamPath.replace(/\/[^/]+$/, ''); // e.g. /api/admin/stream/{churchId}
    m3u8 = m3u8.replace(/^(seg\d+\.ts)$/gm, (match) => {
      return `/api/admin/relay?path=${encodeURIComponent(pathDir + '/' + match)}`;
    });
    return new Response(m3u8, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache, no-store',
      },
    });
  }
  if (contentType.includes('mp2t') || contentType.includes('octet-stream')) {
    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, {
      status: upstream.status,
      headers: {
        'Content-Type': 'video/mp2t',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }

  const text = await upstream.text();
  const [payload] = parseJsonText(text, upstream.status);
  return NextResponse.json(payload, { status: upstream.status });
}

export async function GET(req) { return proxyRequest(req, 'GET'); }
export async function POST(req) { return proxyRequest(req, 'POST'); }
export async function PUT(req) { return proxyRequest(req, 'PUT'); }
export async function DELETE(req) { return proxyRequest(req, 'DELETE'); }
