'use client';

/**
 * Spanish signup page — /es/signup
 *
 * Reuses the core English signup form. The plan and billing interval are read
 * from ?plan= and ?interval= query params, the same as the English page.
 * Full Spanish form-field labels are planned for a future sprint.
 */
import { useEffect, useState } from 'react';
import { BG, CARD_BG as CARD, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DANGER } from '../../../lib/tokens';
import Footer from '../../components/Footer';

const TIERS = [
  { value: 'connect',  name: 'Connect',    monthlyPrice: 49,  annualPrice: 37 },
  { value: 'plus',     name: 'Plus',        monthlyPrice: 99,  annualPrice: 74 },
  { value: 'pro',      name: 'Pro',         monthlyPrice: 149, annualPrice: 112 },
  { value: 'managed',  name: 'Enterprise',  monthlyPrice: 499, annualPrice: 374 },
];

const VALID_PLANS = TIERS.map(t => t.value);

export default function SignupEsPage() {
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
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    const planParam = params.get('plan');
    if (planParam && VALID_PLANS.includes(planParam)) {
      setForm(f => ({ ...f, tier: planParam }));
    }

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
        .catch(() => {});
    }
  }, []);

  function validateField(name, value) {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'El nombre de la iglesia es requerido';
        if (value.trim().length < 2) return 'Mínimo 2 caracteres';
        return '';
      case 'email':
        if (!value.trim()) return 'El correo electrónico es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingresa un correo electrónico válido';
        return '';
      case 'password':
        if (!value) return 'La contraseña es requerida';
        if (value.length < 8) return `Faltan ${8 - value.length} carácter${8 - value.length !== 1 ? 'es' : ''}`;
        return '';
      case 'confirmPassword':
        if (!value) return 'Por favor confirma tu contraseña';
        if (value !== form.password) return 'Las contraseñas no coinciden';
        return '';
      default:
        return '';
    }
  }

  function handleBlur(name) {
    setTouched(t => ({ ...t, [name]: true }));
    setFieldErrors(f => ({ ...f, [name]: validateField(name, form[name]) }));
  }

  function handleChange(name, value) {
    const updated = { ...form, [name]: value };
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) {
      setFieldErrors(f => ({ ...f, [name]: validateField(name, value) }));
    }
    if (name === 'password' && touched.confirmPassword) {
      const cpErr = updated.confirmPassword
        ? (value !== updated.confirmPassword ? 'Las contraseñas no coinciden' : '')
        : 'Por favor confirma tu contraseña';
      setFieldErrors(f => ({ ...f, confirmPassword: cpErr }));
    }
  }

  function getPasswordStrength(pw) {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: 'Débil', color: DANGER };
    if (score <= 2) return { level: 2, label: 'Regular', color: '#f59e0b' };
    if (score <= 3) return { level: 3, label: 'Buena', color: '#3b82f6' };
    return { level: 4, label: 'Fuerte', color: GREEN };
  }

  const pwStrength = getPasswordStrength(form.password);
  const canContinue = !submitting && tosAccepted && privacyAccepted;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const allErrors = {};
    ['name', 'email', 'password', 'confirmPassword'].forEach(f => {
      const err = validateField(f, form[f]);
      if (err) allErrors[f] = err;
    });
    setFieldErrors(allErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (Object.values(allErrors).some(Boolean)) {
      setError('Por favor corrige los errores indicados.');
      setSubmitting(false);
      return;
    }

    if (!tosAccepted || !privacyAccepted) {
      setError('Debes aceptar los Términos de Servicio y la Política de Privacidad.');
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
        setError(data.error || 'No se pudo crear la cuenta');
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        const params = new URLSearchParams({ church: data.name || form.name });
        if (data.registrationCode) params.set('code', data.registrationCode);
        window.location.href = `/signup/success?${params.toString()}`;
      }
    } catch (err) {
      setError(err.message || 'Error de red. Verifica tu conexión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Minimal nav for the signup page */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 5%',
      }}>
        <a href="/es" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: GREEN, display: 'inline-block' }} />
          <span style={{ color: WHITE, fontWeight: 900, fontSize: '1.15rem' }}>Tally</span>
        </a>
        <a href="/signup" style={{ color: MUTED, fontSize: '0.82rem', textDecoration: 'none' }}>English</a>
      </nav>

      <main style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", paddingTop: 80, paddingLeft: 20, paddingRight: 20 }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
            <h1 style={{ fontSize: 28, marginBottom: 8 }}>Crea tu Cuenta Tally</h1>
            <p style={{ color: MUTED, lineHeight: 1.55, marginBottom: 18 }}>
              Comienza tu prueba gratuita — sin tarjeta de crédito. Inicia sesión en la aplicación de escritorio con tu correo y contraseña.
            </p>

            {referralCode && (
              <div style={{ marginBottom: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: GREEN_LT, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🎁</span>
                <span>
                  {referrerName
                    ? <>Referido por <strong>{referrerName}</strong>. Crea tu cuenta y suscríbete — ambos obtendrán un mes gratis.</>
                    : <>¡Fuiste referido por un amigo! Crea tu cuenta y suscríbete — ambos obtendrán un mes gratis.</>
                  }
                </span>
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
                  {[['monthly', 'Mensual'], ['annual', 'Anual (25% descuento)']].map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => handleChange('billingInterval', val)}
                      style={{
                        padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6,
                        border: `1px solid ${form.billingInterval === val ? GREEN : BORDER}`,
                        background: form.billingInterval === val ? 'rgba(34,197,94,0.1)' : 'transparent',
                        color: form.billingInterval === val ? GREEN : MUTED, cursor: 'pointer',
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {TIERS.map(tier => {
                  const price = form.billingInterval === 'annual' ? tier.annualPrice : tier.monthlyPrice;
                  const isSelected = form.tier === tier.value;
                  return (
                    <button key={tier.value} type="button"
                      onClick={() => handleChange('tier', tier.value)}
                      style={{
                        padding: '10px 12px', borderRadius: 8, textAlign: 'left',
                        border: `1px solid ${isSelected ? GREEN : BORDER}`,
                        background: isSelected ? 'rgba(34,197,94,0.08)' : 'transparent', cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? GREEN : WHITE }}>{tier.name}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {tier.value === 'managed' ? 'Contáctenos' : `$${price}/mes`}
                      </div>
                    </button>
                  );
                })}
              </div>
              {form.tier === 'connect' && (
                <p style={{ fontSize: 11, color: GREEN, marginTop: 6 }}>★ Tarifa Iglesia Fundadora — plazas limitadas a $49/mes</p>
              )}
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="es-signup-name" style={labelStyle}>Nombre de la Iglesia</label>
              <input id="es-signup-name" aria-describedby="es-signup-name-error" aria-invalid={!!(touched.name && fieldErrors.name)}
                style={inputVariant(touched.name && fieldErrors.name)} value={form.name}
                onChange={e => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')}
                required placeholder="ej. Iglesia Gracia y Verdad"
              />
              <FieldError id="es-signup-name-error" msg={touched.name && fieldErrors.name} />

              <label htmlFor="es-signup-email" style={labelStyle}>Correo Electrónico del Admin</label>
              <input id="es-signup-email" aria-describedby="es-signup-email-error" aria-invalid={!!(touched.email && fieldErrors.email)}
                style={inputVariant(touched.email && fieldErrors.email)} type="email" value={form.email}
                onChange={e => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')}
                required placeholder="td@tuilgesia.org"
              />
              <FieldError id="es-signup-email-error" msg={touched.email && fieldErrors.email} />

              <label htmlFor="es-signup-password" style={labelStyle}>Contraseña</label>
              <input id="es-signup-password" aria-describedby="es-signup-password-error" aria-invalid={!!(touched.password && fieldErrors.password)}
                style={inputVariant(touched.password && fieldErrors.password)} type="password" minLength={8} value={form.password}
                onChange={e => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')}
                required placeholder="Mínimo 8 caracteres"
              />
              {form.password && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength.level ? pwStrength.color : BORDER, transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: pwStrength.color, minWidth: 40 }}>{pwStrength.label}</span>
                </div>
              )}
              <FieldError id="es-signup-password-error" msg={touched.password && fieldErrors.password} />

              <label htmlFor="es-signup-confirm" style={labelStyle}>Confirmar Contraseña</label>
              <input id="es-signup-confirm" aria-describedby="es-signup-confirm-error" aria-invalid={!!(touched.confirmPassword && fieldErrors.confirmPassword)}
                style={inputVariant(touched.confirmPassword && fieldErrors.confirmPassword)} type="password" value={form.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)} onBlur={() => handleBlur('confirmPassword')}
                required placeholder="Repite tu contraseña"
              />
              <FieldError id="es-signup-confirm-error" msg={touched.confirmPassword && fieldErrors.confirmPassword} />

              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={tosAccepted} onChange={e => setTosAccepted(e.target.checked)} style={{ marginTop: 3, accentColor: GREEN }} />
                <span>Acepto los <a href="/terms" target="_blank" rel="noopener" style={{ color: GREEN, textDecoration: 'underline' }}>Términos de Servicio</a></span>
              </label>

              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} style={{ marginTop: 3, accentColor: GREEN }} />
                <span>Acepto la <a href="/privacy" target="_blank" rel="noopener" style={{ color: GREEN, textDecoration: 'underline' }}>Política de Privacidad</a></span>
              </label>

              <button type="submit" disabled={!canContinue} style={{
                marginTop: 16, width: '100%', border: 0, borderRadius: 8,
                padding: '11px 14px', fontSize: 14, fontWeight: 700,
                background: GREEN, color: '#03140A',
                cursor: canContinue ? 'pointer' : 'default',
                opacity: canContinue ? 1 : 0.6,
              }}>
                {submitting ? 'Creando cuenta…' : 'Crear Cuenta y Comenzar Prueba Gratis'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function FieldError({ id, msg }) {
  return (
    <p id={id} aria-live="polite" style={{ margin: '4px 0 0', fontSize: 12, color: DANGER, lineHeight: 1.4, minHeight: 18 }}>
      {msg || ''}
    </p>
  );
}

const labelStyle = { display: 'block', fontSize: 12, color: MUTED, marginBottom: 6, marginTop: 12 };

const checkboxRowStyle = { display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16, cursor: 'pointer', fontSize: 13, color: MUTED, lineHeight: 1.5 };

function inputVariant(hasError) {
  return {
    width: '100%', border: `1px solid ${hasError ? DANGER : BORDER}`, borderRadius: 8,
    background: '#09090B', color: WHITE, fontSize: 14, padding: '10px 12px',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  };
}
