'use client';
import { useState } from 'react';
import { CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

export default function EarlyAccessForm() {
  const [form, setForm] = useState({ name: '', church: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setError(true);
    } catch {
      setError(true);
    }
    setSubmitting(false);
  };

  return (
    <section id="early-access" style={{
      padding: '128px 5%',
      background: CARD_BG,
      borderTop: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <p style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.15em', color: GREEN, marginBottom: 20,
          }}>EARLY ACCESS &mdash; LIMITED SPOTS</p>

          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900,
            letterSpacing: '-0.03em', margin: '0 0 16px', color: WHITE,
          }}>JOIN THE FOUNDING CHURCHES.</h2>

          <p style={{ color: MUTED, marginBottom: 16, lineHeight: 1.7, fontSize: '1rem' }}>
            Early access churches get 30 days free, locked-in pricing, and direct access to Andrew during onboarding.
          </p>
          <p style={{ color: DIM, marginBottom: 48, lineHeight: 1.7, fontSize: '0.9rem' }}>
            No credit card required. Setup takes 10 minutes.
          </p>

          {submitted ? (
            <div style={{
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 16, padding: 48,
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{'\ud83c\udf89'}</div>
              <p style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 10px', color: WHITE }}>You&apos;re on the list!</p>
              <p style={{ color: MUTED, margin: 0, fontSize: '0.95rem', lineHeight: 1.65 }}>
                Andrew will be in touch within 24 hours with your setup link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'name',   type: 'text',  placeholder: 'Your name',    required: true },
                { key: 'church', type: 'text',  placeholder: 'Church name',   required: false },
                { key: 'email',  type: 'email', placeholder: 'Email address', required: true },
              ].map(({ key, type, placeholder, required }) => (
                <input
                  key={key}
                  type={type}
                  placeholder={placeholder}
                  required={required}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{
                    padding: '15px 18px', borderRadius: 10,
                    border: `1px solid ${BORDER}`,
                    background: 'rgba(255,255,255,0.04)', color: WHITE,
                    fontSize: '1rem', outline: 'none', fontFamily: 'inherit',
                  }}
                />
              ))}

              {error && (
                <p style={{ color: '#fca5a5', fontSize: '0.88rem', margin: 0 }}>
                  Something went wrong &mdash; email{' '}
                  <a href="mailto:andrew@atemschool.com" style={{ color: '#fca5a5' }}>andrew@atemschool.com</a>{' '}
                  directly.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '15px 24px', fontSize: '1rem', fontWeight: 700,
                  borderRadius: 10, border: 'none', background: GREEN,
                  color: '#000', cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.7 : 1, marginTop: 4,
                }}
              >
                {submitting ? 'Sending...' : 'Request Early Access \u2014 Free for 30 Days \u2192'}
              </button>

              <p style={{ color: DIM, fontSize: '0.82rem', margin: 0, marginTop: 4 }}>
                Limited spots. No credit card. Cancel anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
