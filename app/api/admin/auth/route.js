import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Tally-F78AFA6FF4F77D9D';
const SESSION_SECRET = process.env.SESSION_SECRET || 'tally-session-secret';

export async function POST(req) {
  try {
    const { password } = await req.json();
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    // Simple token: base64(timestamp:secret_hash)
    const token = Buffer.from(`${Date.now()}:${SESSION_SECRET}`).toString('base64');
    return NextResponse.json({ token, ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
