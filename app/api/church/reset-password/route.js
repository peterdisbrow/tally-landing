import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { checkRateLimit } from '../../../../lib/rate-limit';

const SECRET = process.env.SESSION_SECRET;
if (!SECRET && process.env.NODE_ENV === 'production') {
  console.error('⚠️  SESSION_SECRET is not set — password reset will fail at runtime.');
}
import { RELAY_URL } from '../../../../lib/relay';
const RELAY_KEY = process.env.RELAY_ADMIN_KEY || process.env.ADMIN_API_KEY;

/**
 * Verify a stateless HMAC reset token.
 * Returns { valid: true, email } or { valid: false, error }.
 */
function verifyResetToken(token) {
  if (!SECRET || !token) return { valid: false, error: 'Missing token or secret' };

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return { valid: false, error: 'Malformed token' };

    const [email, expiresAtStr, sig] = parts;
    const expiresAt = Number(expiresAtStr);

    if (!email || !Number.isFinite(expiresAt) || !sig) {
      return { valid: false, error: 'Invalid token fields' };
    }

    // Check expiry
    if (Date.now() > expiresAt) {
      return { valid: false, error: 'Token expired' };
    }

    // Verify signature
    const payload = `${email}:${expiresAtStr}`;
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');

    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true, email };
  } catch {
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * POST /api/church/reset-password
 * Body: { token, password }
 *
 * Verifies the reset token, then asks the relay to update the password.
 */
export async function POST(req) {
  const rateLimitResult = await checkRateLimit('resetPw', req);
  if (!rateLimitResult.success) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  if (!RELAY_URL) {
    return NextResponse.json({ error: 'Relay URL not configured' }, { status: 500 });
  }
  if (!SECRET) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { token, password } = body || {};
  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const result = verifyResetToken(token);
  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Update password via relay admin API
  try {
    const upstream = await fetch(`${RELAY_URL}/api/church/app/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(RELAY_KEY ? { 'x-api-key': RELAY_KEY } : {}),
      },
      body: JSON.stringify({ email: result.email, password }),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || 'Unexpected relay response' };
    }

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data.error || 'Password reset failed on the relay server' },
        { status: upstream.status },
      );
    }

    return NextResponse.json({ ok: true, message: 'Password updated. You can now sign in.' });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Relay request failed' }, { status: 502 });
  }
}
