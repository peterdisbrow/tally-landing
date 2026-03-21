import { NextResponse } from 'next/server';
import { RELAY_URL } from '../../../lib/relay';
import { checkRateLimit } from '../../../lib/rate-limit';

export async function GET(req) {
  const { success } = await checkRateLimit('referral', req);
  if (!success) {
    return NextResponse.json({ valid: false }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const code = (searchParams.get('code') || '').trim().toUpperCase();
  if (!code || code.length < 4) {
    return NextResponse.json({ valid: false });
  }
  if (!RELAY_URL) {
    return NextResponse.json({ valid: false });
  }

  try {
    const res = await fetch(`${RELAY_URL}/api/referral/${encodeURIComponent(code)}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ valid: false });
  }
}
