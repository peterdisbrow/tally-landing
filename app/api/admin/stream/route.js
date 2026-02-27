import { RELAY_URL } from '../../../../lib/relay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isLikelyJwt(token) {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
}

/**
 * SSE streaming proxy — pipes real-time church status updates from the relay server.
 * Auth: JWT passed as query param (EventSource can't set custom headers).
 * Validates token by calling /api/admin/me on the relay before opening the SSE stream.
 */
export async function GET(req) {
  if (!RELAY_URL) {
    return new Response(JSON.stringify({ error: 'Relay URL not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token') || '';
  if (!token || !isLikelyJwt(token)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate token against relay server
  try {
    const validateRes = await fetch(`${RELAY_URL}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!validateRes.ok) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Token validation failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Open SSE connection to relay server using admin API key
  const adminKey = process.env.ADMIN_API_KEY || process.env.RELAY_ADMIN_KEY || '';
  let upstream;
  try {
    upstream = await fetch(`${RELAY_URL}/api/dashboard/stream`, {
      headers: { 'x-api-key': adminKey },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'SSE upstream connection failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(JSON.stringify({ error: `SSE upstream error: ${upstream.status}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Pipe the SSE stream through to the client
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
