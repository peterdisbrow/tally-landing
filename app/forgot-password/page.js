'use client';

import { useState } from 'react';
import { BG, CARD_BG as CARD, BORDER, GREEN, WHITE, MUTED, DANGER } from '../../lib/tokens';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/church/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: '48px 20px' }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 8px ${GREEN}` }} />
            <span style={{ color: WHITE, fontWeight: 900, fontSize: '1.2rem' }}>Tally</span>
          </a>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '32px 28px' }}>
          <h1 style={{ fontSize: 24, marginBottom: 6, fontWeight: 800 }}>Reset your password</h1>
          <p style={{ color: MUTED, lineHeight: 1.55, marginBottom: 24, fontSize: 14 }}>
            Enter the email address for your church account and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <div style={{
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 10, padding: '24px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{'\u2709\ufe0f'}</div>
              <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 8px' }}>Check your email</p>
              <p style={{ color: MUTED, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                If an account exists with <strong style={{ color: WHITE }}>{email}</strong>, you&apos;ll receive a reset link shortly. The link expires in 1 hour.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: DANGER, borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label style={labelStyle}>Email address</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="td@yourchurch.org"
                  autoComplete="email"
                />

                <button type="submit" disabled={submitting} style={{
                  marginTop: 20, width: '100%', border: 0, borderRadius: 8,
                  padding: '12px 14px', fontSize: 15, fontWeight: 700,
                  background: GREEN, color: '#03140A',
                  cursor: submitting ? 'default' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}>
                  {submitting ? 'Sending\u2026' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <a href="/signin" style={{ color: MUTED, textDecoration: 'none' }}>&larr; Back to sign in</a>
        </div>
      </div>
    </main>
  );
}

const labelStyle = { display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 };
const inputStyle = {
  width: '100%', border: '1px solid #1a2e1f', borderRadius: 8,
  background: '#09090B', color: '#F8FAFC', fontSize: 14, padding: '11px 12px', boxSizing: 'border-box',
};
