import { NextResponse } from 'next/server';
import { RELAY_URL } from '../../../../lib/relay';
import { checkRateLimit } from '../../../../lib/rate-limit';

export async function POST(req) {
  if (!RELAY_URL) {
    return NextResponse.json({ error: 'Relay URL not configured' }, { status: 500 });
  }

  const rl = await checkRateLimit('login', req);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many login attempts. Try again in a minute.' }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${RELAY_URL}/api/church/app/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
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
