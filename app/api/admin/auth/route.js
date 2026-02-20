import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;

function hmacToken(secret, ttlMs = 8 * 60 * 60 * 1000) {
  const now = Date.now();
  const raw = `${now}:${crypto.randomBytes(6).toString('hex')}`;
  const sig = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return `${raw}:${sig}:${ttlMs}`;
}

function badConfig(message) {
  const details = `Missing required environment variable(s): ${message}. Set it in your Vercel/hosting environment.`;
  return NextResponse.json({ error: details }, { status: 500 });
}

export async function POST(req) {
  try {
    if (!ADMIN_PASSWORD || !SESSION_SECRET) {
      return badConfig('ADMIN_PASSWORD and/or SESSION_SECRET');
    }

    const { password } = await req.json();
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = Buffer.from(hmacToken(SESSION_SECRET)).toString('base64');
    return NextResponse.json({ token, ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
