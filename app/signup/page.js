'use client';

import { useEffect, useMemo, useState } from 'react';
import { BG, CARD_BG as CARD, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DANGER } from '../../lib/tokens';

const BILLING_INTERVALS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

const TIERS = [
  { value: 'connect', name: 'Connect', monthly: 49, annual: 490 },
  { value: 'plus', name: 'Plus', monthly: 99, annual: 990 },
  { value: 'pro', name: 'Pro', monthly: 149, annual: 1490 },
  { value: 'managed', name: 'Enterprise', monthly: 499, annual: 4990 },
];

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    tier: 'connect',
    billingInterval: 'monthly',
  });
  const [referralCode, setReferralCode] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const selectedTier = TIERS.find((tier) => tier.value === form.tier) || TIERS[0];
  const selectedAmount = form.billingInterval === 'annual' ? selectedTier.annual : selectedTier.monthly;

  // Read plan + interval + referral from query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    const interval = params.get('interval');
    const ref = params.get('ref');
    if (plan && TIERS.some(t => t.value === plan)) {
      setForm(f => ({ ...f, tier: plan }));
    }
    if (interval === 'annual' || interval === 'monthly') {
      setForm(f => ({ ...f, billingInterval: interval }));
    }
    if (ref) {
      setReferralCode(ref);
    }
  }, []);

  const statusMessage = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const status = new URLSearchParams(window.location.search).get('status');
    if (status === 'paid') return 'Payment completed. You can now sign in from the Tally desktop app.';
    if (status === 'cancelled') return 'Checkout was canceled. You can resume it by creating the account again.';
    return '';
  }, []);

  const canContinue = !submitting && tosAccepted && privacyAccepted;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(null);

    if (!tosAccepted || !privacyAccepted) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/church/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tosAccepted: true,
          privacyAccepted: true,
          tosAcceptedAt: new Date().toISOString(),
          ...(referralCode ? { referralCode } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Could not create account');
        return;
      }

      setSuccess(data);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // No Stripe checkout — go straight to success page
        const params = new URLSearchParams({ church: data.name || form.name });
        if (data.registrationCode) params.set('code', data.registrationCode);
        window.location.href = `/signup/success?${params.toString()}`;
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: '48px 20px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <a href="/" style={{ color: MUTED, textDecoration: 'none', fontSize: 13 }}>← Back to Home</a>

        <div style={{ marginTop: 14, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Create Your Tally Account</h1>
          <p style={{ color: MUTED, lineHeight: 1.55, marginBottom: 18 }}>
            Sign up, start billing checkout, then log into the desktop app with your email and password.
          </p>

          {referralCode && (
            <div style={{ marginBottom: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: GREEN_LT, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>&#127873;</span>
              <span>You were referred by a friend! Create your new account and subscribe — you&apos;ll both get a free month.</span>
            </div>
          )}

          {statusMessage && (
            <div style={{ marginBottom: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.35)', color: GREEN_LT, borderRadius: 8, padding: 10, fontSize: 13 }}>
              {statusMessage}
            </div>
          )}

          {error && (
            <div style={{ marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: DANGER, borderRadius: 8, padding: 10, fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Church Name</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Disbrow Church" />

            <label style={labelStyle}>Admin Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required placeholder="td@yourchurch.org" />

            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" minLength={8} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required placeholder="Minimum 8 characters" />

            <label style={labelStyle}>Plan</label>
            <select style={inputStyle} value={form.tier} onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}>
              {TIERS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.name} ({form.billingInterval === 'annual' ? `$${tier.annual}/yr` : `$${tier.monthly}/mo`})
                </option>
              ))}
            </select>

            <label style={labelStyle}>Billing Cycle</label>
            <div style={intervalWrapStyle}>
              {BILLING_INTERVALS.map((interval) => {
                const active = form.billingInterval === interval.value;
                return (
                  <button
                    key={interval.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, billingInterval: interval.value }))}
                    style={{
                      ...intervalButtonStyle,
                      background: active ? 'rgba(34,197,94,0.18)' : 'transparent',
                      borderColor: active ? GREEN : BORDER,
                      color: active ? GREEN_LT : MUTED,
                    }}
                  >
                    {interval.label}
                  </button>
                );
              })}
            </div>
            <p style={{ margin: '8px 0 0', color: MUTED, fontSize: 12 }}>
              {form.billingInterval === 'annual'
                ? `${selectedTier.name} billed yearly at $${selectedAmount}/yr.`
                : `${selectedTier.name} billed monthly at $${selectedAmount}/mo.`}
            </p>

            <label style={checkboxRowStyle}>
              <input type="checkbox" checked={tosAccepted} onChange={(e) => setTosAccepted(e.target.checked)} style={{ marginTop: 3, accentColor: GREEN }} />
              <span>
                I agree to the{' '}
                <a href="/terms" target="_blank" rel="noopener" style={{ color: GREEN, textDecoration: 'underline' }}>Terms of Service</a>
              </span>
            </label>

            <label style={checkboxRowStyle}>
              <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} style={{ marginTop: 3, accentColor: GREEN }} />
              <span>
                I agree to the{' '}
                <a href="/privacy" target="_blank" rel="noopener" style={{ color: GREEN, textDecoration: 'underline' }}>Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={!canContinue} style={{
              marginTop: 16,
              width: '100%',
              border: 0,
              borderRadius: 8,
              padding: '11px 14px',
              fontSize: 14,
              fontWeight: 700,
              background: GREEN,
              color: '#03140A',
              cursor: canContinue ? 'pointer' : 'default',
              opacity: canContinue ? 1 : 0.6,
            }}>
              {submitting ? 'Creating account…' : 'Create Account & Continue to Checkout'}
            </button>
          </form>

          {success && !success.checkoutUrl && (
            <p style={{ color: MUTED, marginTop: 14, fontSize: 13 }}>
              Account created. Billing checkout URL was not returned. Contact support if this is unexpected.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  color: MUTED,
  marginBottom: 6,
  marginTop: 12,
};

const checkboxRowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  marginTop: 16,
  cursor: 'pointer',
  fontSize: 13,
  color: MUTED,
  lineHeight: 1.5,
};

const inputStyle = {
  width: '100%',
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  background: '#09090B',
  color: WHITE,
  fontSize: 14,
  padding: '10px 12px',
};

const intervalWrapStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
};

const intervalButtonStyle = {
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  background: 'transparent',
  color: MUTED,
  fontSize: 13,
  fontWeight: 700,
  padding: '9px 10px',
  cursor: 'pointer',
};
