import { NextResponse } from 'next/server';

const RELAY_URL = process.env.RELAY_URL || 'https://tally-production-cde2.up.railway.app';

/**
 * POST /api/admin/auth
 * Proxy admin login to relay server.
 * Body: { email, password }
 * Returns: { token, user: { id, email, name, role } }
 */
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${RELAY_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

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
