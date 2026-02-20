import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

const SECRET = process.env.SESSION_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tally.atemschool.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Tally by ATEM School <noreply@atemschool.com>';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a stateless, signed reset token.
 * Format: base64url( email : expiresAt : hmac(email:expiresAt, secret) )
 * No database needed — the signature IS the proof.
 */
function generateResetToken(email) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${email}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

/**
 * Build the HTML email body for password resets.
 */
function buildResetEmailHtml(resetUrl) {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 0;">
      <div style="margin-bottom: 24px;">
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #22c55e; margin-right: 8px;"></span>
        <strong style="font-size: 16px; color: #111;">Tally</strong>
      </div>
      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        You requested a password reset for your Tally account. Click the button below to set a new password.
      </p>
      <p style="margin: 28px 0;">
        <a href="${resetUrl}" style="
          display: inline-block; padding: 12px 28px; font-size: 15px; font-weight: 700;
          background: #22c55e; color: #000; text-decoration: none; border-radius: 8px;
        ">Reset Password</a>
      </p>
      <p style="font-size: 13px; color: #666; line-height: 1.5;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #999;">
        Tally by ATEM School &mdash; <a href="https://tally.atemschool.com" style="color: #999;">tally.atemschool.com</a>
      </p>
    </div>
  `;
}

/**
 * Send the reset email via Resend.
 * Falls back to console logging if RESEND_API_KEY is not set.
 */
async function sendResetEmail(email, resetUrl) {
  if (!RESEND_API_KEY) {
    console.log(`[password-reset] No RESEND_API_KEY — would send to ${email}: ${resetUrl}`);
    return { sent: false, reason: 'no-api-key' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Reset your Tally password',
        html: buildResetEmailHtml(resetUrl),
        text: `Reset your Tally password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n\nTally by ATEM School — tally.atemschool.com`,
        tags: [{ name: 'category', value: 'password-reset' }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[password-reset] Resend failed (${res.status}): ${err}`);
      return { sent: false, reason: 'resend-error' };
    }

    const data = await res.json();
    console.log(`[password-reset] Sent to ${email}, id: ${data.id}`);
    return { sent: true, id: data.id };
  } catch (e) {
    console.error(`[password-reset] Email send failed: ${e.message}`);
    return { sent: false, reason: 'network-error' };
  }
}

export async function POST(req) {
  if (!SECRET) {
    return NextResponse.json({ error: 'Server misconfigured (SESSION_SECRET missing)' }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = body?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const token = generateResetToken(email);
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await sendResetEmail(email, resetUrl);

  return NextResponse.json({
    ok: true,
    message: 'If an account exists with that email, a reset link has been sent.',
  });
}
