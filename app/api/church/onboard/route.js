import { NextResponse } from 'next/server';

const RELAY_URL = process.env.RELAY_URL || process.env.NEXT_PUBLIC_RELAY_URL || 'https://tally-production-cde2.up.railway.app';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tally.atemschool.com';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
  }

  const payload = {
    ...body,
    successUrl: body.successUrl || `${APP_URL}/signup?status=paid`,
    cancelUrl: body.cancelUrl || `${APP_URL}/signup?status=cancelled`,
  };

  try {
    const upstream = await fetch(`${RELAY_URL}/api/church/app/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
