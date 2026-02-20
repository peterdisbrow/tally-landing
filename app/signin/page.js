'use client';

import { useState } from 'react';

const BG = '#09090B';
const CARD = '#0F1613';
const BORDER = '#1a2e1f';
const GREEN = '#22c55e';
const WHITE = '#F8FAFC';
const MUTED = '#94A3B8';
const DANGER = '#ef4444';

export default function SignInPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/church/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Invalid email or password');
        return;
      }

      // Store session token and redirect to portal
      if (data.token) {
        sessionStorage.setItem('tally_token', data.token);
        const cId = data.churchId || data.church?.churchId;
        const cName = data.churchName || data.church?.name;
        if (cId) sessionStorage.setItem('tally_church_id', cId);
        if (cName) sessionStorage.setItem('tally_church_name', cName);
        window.location.href = '/portal';
      } else {
        setError('Login succeeded but no session token was returned.');
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
          <h1 style={{ fontSize: 24, marginBottom: 6, fontWeight: 800 }}>Sign in to your church</h1>
          <p style={{ color: MUTED, lineHeight: 1.55, marginBottom: 24, fontSize: 14 }}>
            Access your dashboard, manage your account, and check equipment status.
          </p>

          {error && (
            <div style={{ marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: DANGER, borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              placeholder="td@yourchurch.org"
              autoComplete="email"
            />

            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              placeholder="Your password"
              autoComplete="current-password"
            />

            <button type="submit" disabled={submitting} style={{
              marginTop: 20,
              width: '100%',
              border: 0,
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 15,
              fontWeight: 700,
              background: GREEN,
              color: '#03140A',
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}>
              {submitting ? 'Signing in\u2026' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13 }}>
            <a href="/forgot-password" style={{ color: MUTED, textDecoration: 'none' }}>
              Forgot your password?
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <span style={{ color: MUTED }}>Don&apos;t have an account? </span>
          <a href="/signup" style={{ color: GREEN, textDecoration: 'none', fontWeight: 600 }}>Sign up</a>
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
  marginTop: 14,
};

const inputStyle = {
  width: '100%',
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  background: '#09090B',
  color: WHITE,
  fontSize: 14,
  padding: '11px 12px',
  boxSizing: 'border-box',
};
