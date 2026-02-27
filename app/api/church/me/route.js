import { NextResponse } from 'next/server';
import { RELAY_URL } from '../../../../lib/relay';

/**
 * Proxy authenticated church requests to the relay server.
 * Expects Authorization: Bearer <token> from the client.
 *
 * GET  /api/church/me  — fetch church profile + live status
 * PUT  /api/church/me  — update email or request password reset
 */

async function proxyToRelay(req, method) {
  if (!RELAY_URL) {
    return NextResponse.json({ error: 'Relay URL not configured' }, { status: 500 });
  }

  const auth = req.headers.get('authorization');
  if (!auth) {
    return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: auth,
  };

  const fetchOpts = { method, headers };

  if (method !== 'GET') {
    try {
      fetchOpts.body = JSON.stringify(await req.json());
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
  }

  try {
    const upstream = await fetch(`${RELAY_URL}/api/church/app/me`, fetchOpts);
    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || 'Unexpected relay response' };
    }
    return NextResponse.json(data, { status: upstream.status });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Relay request failed' }, { status: 502 });
  }
}

export async function GET(req) {
  return proxyToRelay(req, 'GET');
}

export async function PUT(req) {
  return proxyToRelay(req, 'PUT');
}
