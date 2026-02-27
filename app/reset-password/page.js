'use client';

import { useState, useMemo } from 'react';
import { BG, CARD_BG as CARD, BORDER, GREEN, WHITE, MUTED, DANGER } from '../../lib/tokens';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('token') || '';
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/church/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Reset failed');
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  const noToken = typeof window !== 'undefined' && !token;

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
          {noToken ? (
            <>
              <h1 style={{ fontSize: 24, marginBottom: 10, fontWeight: 800 }}>Invalid link</h1>
              <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
                This reset link is missing or malformed.{' '}
                <a href="/forgot-password" style={{ color: GREEN, textDecoration: 'none' }}>
                  Request a new one
                </a>.
              </p>
            </>
          ) : done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 14 }}>{'\u2705'}</div>
              <h1 style={{ fontSize: 22, marginBottom: 8, fontWeight: 800 }}>Password updated</h1>
              <p style={{ color: MUTED, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                Your password has been reset. You can now sign in with your new password.
              </p>
              <a href="/signin" style={{
                display: 'inline-block', padding: '11px 28px', fontSize: 14, fontWeight: 700,
                borderRadius: 8, background: GREEN, color: '#03140A', textDecoration: 'none',
              }}>
                Sign In
              </a>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 24, marginBottom: 6, fontWeight: 800 }}>Set a new password</h1>
              <p style={{ color: MUTED, lineHeight: 1.55, marginBottom: 24, fontSize: 14 }}>
                Choose a new password for your Tally account. Minimum 8 characters.
              </p>

              {error && (
                <div style={{ marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: DANGER, borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label style={labelStyle}>New password</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                />

                <label style={{ ...labelStyle, marginTop: 14 }}>Confirm password</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />

                <button type="submit" disabled={submitting} style={{
                  marginTop: 20, width: '100%', border: 0, borderRadius: 8,
                  padding: '12px 14px', fontSize: 15, fontWeight: 700,
                  background: GREEN, color: '#03140A',
                  cursor: submitting ? 'default' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}>
                  {submitting ? 'Resetting\u2026' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
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
