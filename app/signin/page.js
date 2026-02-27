'use client';

import { useState } from 'react';
import { BG, CARD_BG, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DIM, DANGER } from '../../lib/tokens';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/church/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Check your email and password.');
        setLoading(false);
        return;
      }

      // Store the token and redirect to portal
      if (data.token) {
        localStorage.setItem('tally_church_token', data.token);
        window.location.href = '/portal';
      } else {
        setError('Login succeeded but no token received. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: BG, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: GREEN, marginRight: 8 }} />
          <strong style={{ fontSize: 20, color: WHITE }}>Tally</strong>
        </div>

        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: WHITE }}>Church Portal Sign In</h1>
          <p style={{ fontSize: 14, color: MUTED, margin: '0 0 24px' }}>
            Sign in with the email and password you used during signup.
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourchurch.org"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 15, borderRadius: 8,
                border: `1px solid ${BORDER}`, background: BG, color: WHITE,
                outline: 'none', marginBottom: 16, boxSizing: 'border-box',
              }}
            />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 15, borderRadius: 8,
                border: `1px solid ${BORDER}`, background: BG, color: WHITE,
                outline: 'none', marginBottom: 24, boxSizing: 'border-box',
              }}
            />

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#1c1917', border: `1px solid ${DANGER}`, color: DANGER, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0', fontSize: 15, fontWeight: 700, borderRadius: 8,
                border: 'none', background: GREEN, color: '#000', cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: DIM }}>
            <a href="/forgot-password" style={{ color: GREEN_LT, textDecoration: 'none' }}>Forgot password?</a>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: DIM }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ color: GREEN_LT, textDecoration: 'none' }}>Sign up free</a>
        </div>
      </div>
    </main>
  );
}
