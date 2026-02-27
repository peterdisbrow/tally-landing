import { NextResponse } from 'next/server';
import { RELAY_URL } from '../../../../lib/relay';
import { checkRateLimit } from '../../../../lib/rate-limit';
const COOKIE_NAME = 'tally_admin_token';

function successResponse(data, maxAgeSeconds = 60 * 60 * 12) {
  const response = NextResponse.json(data);
  if (data?.token) {
    response.cookies.set({
      name: COOKIE_NAME,
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: maxAgeSeconds,
    });
  }

  return response;
}

export async function POST(req) {
  if (!RELAY_URL) {
    return NextResponse.json({ error: 'Relay URL not configured' }, { status: 500 });
  }

  const rl = await checkRateLimit('adminAuth', req);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many login attempts. Try again in a minute.' }, { status: 429 });
  }

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

    if (!upstream.ok) {
      return NextResponse.json({ error: data.error || `Request failed (${upstream.status})` }, { status: upstream.status });
    }

    return successResponse(data);
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Relay request failed' }, { status: 502 });
  }
}
