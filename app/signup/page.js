'use client';

import { useEffect, useState } from 'react';
import { BG, CARD_BG as CARD, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DANGER } from '../../lib/tokens';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const TIERS = [
  { value: 'connect',  name: 'Connect',    monthlyPrice: 49,  annualPrice: 37 },
  { value: 'plus',     name: 'Plus',        monthlyPrice: 99,  annualPrice: 74 },
  { value: 'pro',      name: 'Pro',         monthlyPrice: 149, annualPrice: 112 },
  { value: 'managed',  name: 'Enterprise',  monthlyPrice: 499, annualPrice: 374 },
];

const VALID_PLANS = TIERS.map(t => t.value);

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    tier: 'connect',
    billingInterval: 'monthly',
  });
  const [referralCode, setReferralCode] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  /* Field-level validation state */
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  // Read plan + referral code from query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    // Pre-select plan from ?plan= param (set by pricing page CTAs)
    const planParam = params.get('plan');
    if (planParam && VALID_PLANS.includes(planParam)) {
      setForm(f => ({ ...f, tier: planParam }));
    }

    // Pre-select billing interval from ?interval= param
    const intervalParam = params.get('interval');
    if (intervalParam === 'annual' || intervalParam === 'monthly') {
      setForm(f => ({ ...f, billingInterval: intervalParam }));
    }

    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      fetch(`/api/referral?code=${encodeURIComponent(ref)}`)
        .then(r => r.json())
        .then(data => { if (data.valid && data.referrerName) setReferrerName(data.referrerName); })
        .catch(err => console.warn('[Signup] Referral lookup failed (non-critical):', err.message));
    }
  }, []);

  const [statusMessage, setStatusMessage] = useState('');
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status');
    if (status === 'paid') setStatusMessage('Payment completed. You can now sign in from the Tally desktop app.');
    else if (status === 'cancelled') setStatusMessage('Checkout was canceled. You can resume it by creating the account again.');
  }, []);

  /* Validation helpers */
  function validateField(name, value) {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Church name is required';
        if (value.trim().length < 2) return 'Must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return `${8 - value.length} more character${8 - value.length !== 1 ? 's' : ''} needed`;
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== form.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  }

  function handleBlur(name) {
    setTouched(t => ({ ...t, [name]: true }));
    const err = validateField(name, form[name]);
    setFieldErrors(f => ({ ...f, [name]: err }));
  }

  function handleChange(name, value) {
    const updated = { ...form, [name]: value };
    setForm(f => ({ ...f, [name]: value }));
    // Clear error as user types if field was previously touched
    if (touched[name]) {
      const err = validateField(name, value);
      setFieldErrors(f => ({ ...f, [name]: err }));
    }
    // Re-validate confirmPassword when password changes
    if (name === 'password' && touched.confirmPassword) {
      const cpErr = updated.confirmPassword
        ? (value !== updated.confirmPassword ? 'Passwords do not match' : '')
        : 'Please confirm your password';
      setFieldErrors(f => ({ ...f, confirmPassword: cpErr }));
    }
  }

  /* Password strength */
  function getPasswordStrength(pw) {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: DANGER };
    if (score <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { level: 3, label: 'Good', color: '#3b82f6' };
    return { level: 4, label: 'Strong', color: GREEN };
  }

  const pwStrength = getPasswordStrength(form.password);
  const canContinue = !submitting && tosAccepted && privacyAccepted;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(null);

    // Validate all fields
    const allErrors = {};
    ['name', 'email', 'password', 'confirmPassword'].forEach(f => {
      const err = validateField(f, form[f]);
      if (err) allErrors[f] = err;
    });
    setFieldErrors(allErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (Object.values(allErrors).some(Boolean)) {
      setError('Please fix the errors above.');
      setSubmitting(false);
      return;
    }

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
    <>
    <Nav />
    <main style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", paddingTop: 80, paddingLeft: 20, paddingRight: 20 }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Create Your Tally Account</h1>
          <p style={{ color: MUTED, lineHeight: 1.55, marginBottom: 10 }}>
            Start your free trial — no credit card required. Log into the desktop app with your email and password.
          </p>
          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, marginBottom: 18, padding: '8px 12px', background: 'rgba(148,163,184,0.06)', borderRadius: 6, borderLeft: `2px solid ${BORDER}` }}>
            <strong style={{ color: WHITE }}>Alert channels:</strong> Tally sends alerts via Slack and/or Telegram.
            After signup you&apos;ll receive a registration code to connect your team to the <strong style={{ color: WHITE }}>@tallybot</strong> Telegram bot — or configure Slack instead. Both are optional; you can use either or both.
          </p>

          {referralCode && (
            <div style={{ marginBottom: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: GREEN_LT, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>&#127873;</span>
              <span>
                {referrerName
                  ? <>Referred by <strong>{referrerName}</strong>! Create your account and subscribe — you&apos;ll both get a free month.</>
                  : <>You were referred by a friend! Create your new account and subscribe — you&apos;ll both get a free month.</>
                }
              </span>
            </div>
          )}

          {statusMessage && (
            <div style={{ marginBottom: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.35)', color: GREEN_LT, borderRadius: 8, padding: 10, fontSize: 13 }}>
              {statusMessage}
            </div>
          )}

          <div aria-live="polite" aria-atomic="true">
            {error && (
              <div role="alert" style={{ marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: DANGER, borderRadius: 8, padding: 10, fontSize: 13 }}>
                {error}
              </div>
            )}
          </div>

          {/* Plan selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>PLAN</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {['monthly', 'annual'].map(interval => (
                  <button
                    key={interval}
                    type="button"
                    onClick={() => handleChange('billingInterval', interval)}
                    style={{
                      padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6,
                      border: `1px solid ${form.billingInterval === interval ? GREEN : BORDER}`,
                      background: form.billingInterval === interval ? 'rgba(34,197,94,0.1)' : 'transparent',
                      color: form.billingInterval === interval ? GREEN : MUTED,
                      cursor: 'pointer',
                    }}
                  >
                    {interval === 'monthly' ? 'Monthly' : 'Annual (save 25%)'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TIERS.map(tier => {
                const price = form.billingInterval === 'annual' ? tier.annualPrice : tier.monthlyPrice;
                const isSelected = form.tier === tier.value;
                return (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => handleChange('tier', tier.value)}
                    style={{
                      padding: '10px 12px', borderRadius: 8, textAlign: 'left',
                      border: `1px solid ${isSelected ? GREEN : BORDER}`,
                      background: isSelected ? 'rgba(34,197,94,0.08)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? GREEN : WHITE }}>{tier.name}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      {tier.value === 'managed' ? 'Contact us' : `$${price}/mo`}
                    </div>
                  </button>
                );
              })}
            </div>
            {form.tier === 'connect' && (
              <p style={{ fontSize: 11, color: GREEN, marginTop: 6 }}>
                ★ Founding Church Rate — limited spots at $49/mo
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Church Name */}
            <label htmlFor="signup-name" style={labelStyle}>Church Name</label>
            <input
              id="signup-name"
              aria-describedby="signup-name-error"
              aria-invalid={!!(touched.name && fieldErrors.name)}
              style={inputVariant(touched.name && fieldErrors.name)}
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              required
              placeholder="e.g. Grace Community Church"
            />
            <FieldError id="signup-name-error" msg={touched.name && fieldErrors.name} />

            {/* Email */}
            <label htmlFor="signup-email" style={labelStyle}>Admin Email</label>
            <input
              id="signup-email"
              aria-describedby="signup-email-error"
              aria-invalid={!!(touched.email && fieldErrors.email)}
              style={inputVariant(touched.email && fieldErrors.email)}
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              required
              placeholder="td@yourchurch.org"
            />
            <FieldError id="signup-email-error" msg={touched.email && fieldErrors.email} />

            {/* Password */}
            <label htmlFor="signup-password" style={labelStyle}>Password</label>
            <input
              id="signup-password"
              aria-describedby="signup-password-error"
              aria-invalid={!!(touched.password && fieldErrors.password)}
              style={inputVariant(touched.password && fieldErrors.password)}
              type="password"
              minLength={8}
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              required
              placeholder="Minimum 8 characters"
            />
            {/* Password strength bar */}
            {form.password && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background: i <= pwStrength.level ? pwStrength.color : BORDER,
                        transition: 'background 0.2s',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: pwStrength.color, minWidth: 40 }}>
                  {pwStrength.label}
                </span>
              </div>
            )}
            <FieldError id="signup-password-error" msg={touched.password && fieldErrors.password} />

            {/* Confirm Password */}
            <label htmlFor="signup-confirm-password" style={labelStyle}>Confirm Password</label>
            <input
              id="signup-confirm-password"
              aria-describedby="signup-confirm-password-error"
              aria-invalid={!!(touched.confirmPassword && fieldErrors.confirmPassword)}
              style={inputVariant(touched.confirmPassword && fieldErrors.confirmPassword)}
              type="password"
              value={form.confirmPassword}
              onChange={e => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              required
              placeholder="Re-enter your password"
            />
            <FieldError id="signup-confirm-password-error" msg={touched.confirmPassword && fieldErrors.confirmPassword} />

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
              {submitting ? 'Creating account…' : 'Create Account & Start Free Trial'}
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
    <Footer />
    </>
  );
}

/* ── Inline error message ── */
function FieldError({ id, msg }) {
  return (
    <p id={id} aria-live="polite" style={{ margin: '4px 0 0', fontSize: 12, color: DANGER, lineHeight: 1.4, minHeight: 18 }}>
      {msg || ''}
    </p>
  );
}

/* ── Styles ── */
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

function inputVariant(hasError) {
  return {
    width: '100%',
    border: `1px solid ${hasError ? DANGER : BORDER}`,
    borderRadius: 8,
    background: '#09090B',
    color: WHITE,
    fontSize: 14,
    padding: '10px 12px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };
}
