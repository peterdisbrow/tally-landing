import { NextResponse } from 'next/server';
import { RELAY_URL } from '../../../../lib/relay';
import { checkRateLimit } from '../../../../lib/rate-limit';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tallyconnect.app';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Tally by ATEM School <noreply@atemschool.com>';
const GITHUB_RELEASES_URL = 'https://github.com/atemschool/tally/releases/latest';

const ALLOWED_TIERS = new Set(['connect', 'plus', 'pro', 'managed', 'event']);
const ALLOWED_BILLING_INTERVALS = new Set(['monthly', 'annual']);

function sanitizePayload(body = {}) {
  const tier = ALLOWED_TIERS.has(body.tier) ? body.tier : 'connect';
  const intervalInput = String(body.billingInterval || body.billingCycle || '').trim().toLowerCase();
  const billingInterval = ALLOWED_BILLING_INTERVALS.has(intervalInput)
    ? intervalInput
    : 'monthly';

  const result = {
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim(),
    password: String(body.password || ''),
    tier,
    billingInterval,
    tosAccepted: body.tosAccepted === true,
    privacyAccepted: body.privacyAccepted === true,
    tosAcceptedAt: body.tosAcceptedAt || new Date().toISOString(),
  };

  // Pass through referral code if present
  const ref = String(body.referralCode || '').trim().toUpperCase();
  if (ref) result.referralCode = ref;

  return result;
}

/* ── Welcome Email ─────────────────────────────────────────────────────────── */

function buildWelcomeEmailHtml({ churchName, email, registrationCode }) {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
      <div style="margin-bottom: 24px;">
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #22c55e; margin-right: 8px;"></span>
        <strong style="font-size: 16px; color: #111;">Tally</strong>
      </div>

      <h1 style="font-size: 22px; color: #111; margin: 0 0 8px;">Welcome to Tally, ${churchName}!</h1>
      <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 24px;">
        Your account is ready. Here's how to get your production system monitored in under 10 minutes.
      </p>

      <!-- Step 1 -->
      <div style="margin-bottom: 20px; padding: 16px; background: #f8faf9; border-radius: 10px; border: 1px solid #e5e7eb;">
        <div style="font-size: 13px; font-weight: 700; color: #22c55e; margin-bottom: 6px;">STEP 1</div>
        <div style="font-size: 15px; font-weight: 700; color: #111; margin-bottom: 4px;">Download the App</div>
        <p style="font-size: 14px; color: #555; margin: 0 0 12px; line-height: 1.5;">
          Install Tally on your booth computer (the one connected to your ATEM and OBS).
        </p>
        <a href="${GITHUB_RELEASES_URL}" style="
          display: inline-block; padding: 10px 24px; font-size: 14px; font-weight: 700;
          background: #22c55e; color: #000; text-decoration: none; border-radius: 8px;
        ">Download Tally</a>
      </div>

      <!-- Step 2 -->
      <div style="margin-bottom: 20px; padding: 16px; background: #f8faf9; border-radius: 10px; border: 1px solid #e5e7eb;">
        <div style="font-size: 13px; font-weight: 700; color: #22c55e; margin-bottom: 6px;">STEP 2</div>
        <div style="font-size: 15px; font-weight: 700; color: #111; margin-bottom: 4px;">Sign In</div>
        <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.5;">
          Open the app and sign in with your email: <strong>${email}</strong>
        </p>
      </div>

      <!-- Step 3 -->
      <div style="margin-bottom: 24px; padding: 16px; background: #f8faf9; border-radius: 10px; border: 1px solid #e5e7eb;">
        <div style="font-size: 13px; font-weight: 700; color: #22c55e; margin-bottom: 6px;">STEP 3</div>
        <div style="font-size: 15px; font-weight: 700; color: #111; margin-bottom: 4px;">Connect Your Gear</div>
        <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.5;">
          The setup wizard will auto-discover your ATEM, OBS, and other devices on the network. You'll be monitoring in minutes.
        </p>
      </div>

      <!-- Registration Code -->
      <div style="margin-bottom: 24px; padding: 16px; background: #fffbeb; border-radius: 10px; border: 1px solid #fde68a;">
        <div style="font-size: 13px; font-weight: 700; color: #b45309; margin-bottom: 6px;">TELEGRAM SETUP</div>
        <p style="font-size: 14px; color: #555; margin: 0 0 8px; line-height: 1.5;">
          To register your tech directors on Telegram, have them send this command to <strong>@tallybot</strong>:
        </p>
        <div style="font-family: ui-monospace, monospace; font-size: 18px; font-weight: 700; color: #111; letter-spacing: 0.08em; padding: 8px 0;">
          /register ${registrationCode}
        </div>
      </div>

      <!-- Links -->
      <p style="font-size: 14px; color: #555; line-height: 1.6;">
        <strong>Helpful links:</strong><br />
        <a href="${APP_URL}/portal" style="color: #22c55e;">Church Portal</a> &mdash; manage your account, campuses, and settings<br />
        <a href="${APP_URL}/help" style="color: #22c55e;">Help Center</a> &mdash; guides and troubleshooting
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #999;">
        Tally by ATEM School &mdash; <a href="https://tallyconnect.app" style="color: #999;">tallyconnect.app</a>
      </p>
    </div>
  `;
}

function buildWelcomeEmailText({ churchName, email, registrationCode }) {
  return `Welcome to Tally, ${churchName}!

Your account is ready. Here's how to get started:

STEP 1: Download the App
Install Tally on your booth computer: ${GITHUB_RELEASES_URL}

STEP 2: Sign In
Open the app and sign in with: ${email}

STEP 3: Connect Your Gear
The setup wizard will auto-discover your ATEM, OBS, and other devices.

TELEGRAM SETUP
Have your tech directors send this to @tallybot:
/register ${registrationCode}

Church Portal: ${APP_URL}/portal
Help Center: ${APP_URL}/help

Tally by ATEM School — tallyconnect.app`;
}

async function sendWelcomeEmail({ churchName, email, registrationCode }) {
  if (!RESEND_API_KEY) {
    console.log(`[welcome-email] No RESEND_API_KEY — would send welcome to ${email} for "${churchName}"`);
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
        subject: `Welcome to Tally — here's how to get started`,
        html: buildWelcomeEmailHtml({ churchName, email, registrationCode }),
        text: buildWelcomeEmailText({ churchName, email, registrationCode }),
        tags: [{ name: 'category', value: 'welcome' }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[welcome-email] Resend failed (${res.status}): ${err}`);
      return { sent: false, reason: 'resend-error' };
    }

    const data = await res.json();
    console.log(`[welcome-email] Sent to ${email} for "${churchName}", id: ${data.id}`);
    return { sent: true, id: data.id };
  } catch (e) {
    console.error(`[welcome-email] Send failed: ${e.message}`);
    return { sent: false, reason: 'network-error' };
  }
}

/* ── POST Handler ──────────────────────────────────────────────────────────── */

export async function POST(req) {
  if (!RELAY_URL) {
    return NextResponse.json({ error: 'Relay URL not configured' }, { status: 500 });
  }

  const rl = await checkRateLimit('signup', req);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many signup attempts. Try again in a minute.' }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const payload = sanitizePayload(body);

  if (!payload.name || !payload.email || !payload.password) {
    return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
  }

  if (!payload.tosAccepted || !payload.privacyAccepted) {
    return NextResponse.json(
      { error: 'You must accept the Terms of Service and Privacy Policy to create an account.' },
      { status: 400 },
    );
  }

  // Build success URL with church info for the success page
  const successParams = new URLSearchParams({ church: payload.name });
  const relayPayload = {
    ...payload,
    successUrl: `${APP_URL}/signup/success?${successParams.toString()}`,
    cancelUrl: `${APP_URL}/signup?status=cancelled`,
  };

  try {
    const upstream = await fetch(`${RELAY_URL}/api/church/app/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(relayPayload),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || 'Unexpected relay response' };
    }

    // Send welcome email on successful account creation (non-blocking)
    if (upstream.ok && data.created) {
      sendWelcomeEmail({
        churchName: data.name || payload.name,
        email: data.email || payload.email,
        registrationCode: data.registrationCode || '',
      }).catch((e) => {
        console.error(`[welcome-email] Unexpected error: ${e.message}`);
      });

      // Append registration code to success URL if available and checkout URL exists
      if (data.registrationCode && data.checkoutUrl) {
        // The Stripe success_url was already set — registration code will be
        // retrieved from the relay on the success page if needed.
        // We also include it in the welcome email above.
      }
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Relay request failed' }, { status: 502 });
  }
}
