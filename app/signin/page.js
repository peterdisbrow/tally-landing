'use client';

import { useState } from 'react';
import { BG, CARD_BG, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DIM, DANGER } from '../../lib/tokens';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* Field-level validation */
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  function validateField(name, value) {
    if (name === 'email') {
      if (!value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
    }
    if (name === 'password') {
      if (!value) return 'Password is required';
    }
    return '';
  }

  function handleBlur(name, value) {
    setTouched(t => ({ ...t, [name]: true }));
    const err = validateField(name, value);
    setFieldErrors(f => ({ ...f, [name]: err }));
  }

  function handleEmailChange(value) {
    setEmail(value);
    if (touched.email) {
      setFieldErrors(f => ({ ...f, email: validateField('email', value) }));
    }
  }

  function handlePasswordChange(value) {
    setPassword(value);
    if (touched.password) {
      setFieldErrors(f => ({ ...f, password: validateField('password', value) }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validate all fields
    const emailErr = validateField('email', email);
    const pwErr = validateField('password', password);
    setTouched({ email: true, password: true });
    setFieldErrors({ email: emailErr, password: pwErr });

    if (emailErr || pwErr) return;

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
          <a href="/" style={{ textDecoration: 'none', color: WHITE }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: GREEN, marginRight: 8 }} />
            <strong style={{ fontSize: 20, color: WHITE }}>Tally</strong>
          </a>
        </div>

        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: WHITE }}>Church Portal Sign In</h1>
          <p style={{ fontSize: 14, color: MUTED, margin: '0 0 24px' }}>
            Sign in with the email and password you used during signup.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => handleEmailChange(e.target.value)}
              onBlur={() => handleBlur('email', email)}
              placeholder="admin@yourchurch.org"
              style={inputVariant(touched.email && fieldErrors.email)}
            />
            <FieldError msg={touched.email && fieldErrors.email} />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 6, marginTop: 16 }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => handlePasswordChange(e.target.value)}
              onBlur={() => handleBlur('password', password)}
              placeholder="••••••••"
              style={inputVariant(touched.password && fieldErrors.password)}
            />
            <FieldError msg={touched.password && fieldErrors.password} />

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.35)`, color: DANGER, fontSize: 13, marginTop: 16 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 20,
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

/* ── Inline error message ── */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p style={{ margin: '4px 0 0', fontSize: 12, color: DANGER, lineHeight: 1.4 }}>
      {msg}
    </p>
  );
}

/* ── Input style with error state ── */
function inputVariant(hasError) {
  return {
    width: '100%',
    padding: '10px 14px',
    fontSize: 15,
    borderRadius: 8,
    border: `1px solid ${hasError ? DANGER : BORDER}`,
    background: BG,
    color: WHITE,
    outline: 'none',
    marginBottom: 0,
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
}
