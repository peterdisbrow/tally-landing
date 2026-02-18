'use client';
import { useState } from 'react';

const RED = '#E84C3D';
const DARK = '#0f172a';
const GREEN = '#22c55e';
const GRAY_BG = '#F8F9FA';

const btn = (bg, color, border) => ({
  display: 'inline-block', padding: '14px 32px', fontSize: '1rem', fontWeight: 600,
  borderRadius: 8, border: border || 'none', background: bg, color, cursor: 'pointer',
  textDecoration: 'none', transition: 'opacity .2s',
});

export default function Home() {
  const [form, setForm] = useState({ name: '', church: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/early-access', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch { setSubmitted(true); }
    setSubmitting(false);
  };

  return (
    <div>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 5%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 8px ${GREEN}` }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem' }}>Tally</span>
        </div>
        <a href="https://atemschool.com" target="_blank" rel="noopener" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>ATEM School ↗</a>
      </nav>

      {/* HERO */}
      <section style={{ background: DARK, color: '#fff', padding: '140px 5% 80px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 auto 20px', maxWidth: 700 }}>
          Your church production system.<br />In your pocket.
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#94a3b8', maxWidth: 600, margin: '0 auto 40px' }}>
          Monitor your ATEM, cameras, and stream health from anywhere. Get alerts before your congregation notices something's wrong.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#early-access" style={btn(RED, '#fff')}>Get Early Access →</a>
          <a href="#features" style={btn('transparent', '#fff', '2px solid rgba(255,255,255,0.3)')}>See How It Works</a>
        </div>

        {/* CSS Diagram */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 60, flexWrap: 'wrap', fontSize: '0.85rem' }}>
          {[
            { label: '📱 Telegram', color: '#0088cc' },
            null,
            { label: '🟢 Tally', color: GREEN },
            null,
            { label: '🎛️ ATEM / OBS / Companion', color: '#64748b' },
          ].map((item, i) =>
            item ? (
              <div key={i} style={{ border: `2px solid ${item.color}`, borderRadius: 8, padding: '12px 20px', color: '#e2e8f0', background: 'rgba(255,255,255,0.05)' }}>{item.label}</div>
            ) : (
              <span key={i} style={{ color: '#475569', fontSize: '1.2rem' }}>→</span>
            )
          )}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ background: '#fff', padding: '24px 5%', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
          Built on Blackmagic Design infrastructure · Bitfocus Companion compatible · Works with OBS Studio
        </p>
      </section>

      {/* PROBLEM */}
      <section style={{ background: '#fff', padding: '80px 5%', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: 48 }}>Something goes wrong. You're not there.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { icon: '📡', title: 'Stream drops mid-service.', desc: "The volunteer on camera doesn't know why." },
            { icon: '🔌', title: 'Your ATEM input dies.', desc: 'Someone has to run to the tech booth to fix it.' },
            { icon: '📞', title: 'You sold them the system.', desc: "Now you're the one they call on Sunday morning." },
          ].map((c, i) => (
            <div key={i} style={{ padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{c.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{c.title}</h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: GRAY_BG, padding: '80px 5%' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: 48 }}>Everything you need. Nothing you don't.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '🟢', title: 'Tally Lights in Your Pocket', desc: "See what's live, what's in preview, and what's recording. Real-time from your phone." },
              { icon: '📹', title: 'Remote Camera Control', desc: 'Cut to any input, adjust PTZ cameras, trigger presets. No physical access needed.' },
              { icon: '🎬', title: 'OBS + Stream Health', desc: 'Live FPS, bitrate, stream status. Get alerted the moment something drops.' },
              { icon: '🎛️', title: 'Companion Integration', desc: 'Trigger any Bitfocus Companion button remotely. One message controls your whole production.' },
              { icon: '🖼️', title: 'Visual Preview', desc: "See a live thumbnail of what's on screen. Know what your congregation is seeing." },
              { icon: '✅', title: 'Pre-Service Checklist', desc: '30 minutes before service: automated health check on every device. Issues flagged before the service starts.' },
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 32 }}>
                <div style={{ fontSize: '1.75rem', marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#fff', padding: '80px 5%' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: 48 }}>Set up in under 10 minutes</h2>
          {[
            { step: '1', title: 'Install the Tally app on your production computer', code: 'npx tally --token YOUR_TOKEN' },
            { step: '2', title: 'Connect your ATEM IP and OBS', code: 'One config screen. That\'s it.' },
            { step: '3', title: 'Control everything from Telegram', code: 'tally status → 🟢 ATEM connected | Cam 3 live | Stream: 847kbps 30fps' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 24, marginBottom: 40, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 48, height: 48, borderRadius: '50%', background: DARK, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>{s.step}</div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>{s.title}</h3>
                <code style={{ display: 'inline-block', background: '#f1f5f9', padding: '8px 16px', borderRadius: 6, fontSize: '0.85rem', color: '#334155' }}>{s.code}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ background: DARK, padding: '80px 5%', color: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Simple pricing. Cancel anytime.</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 48 }}>All plans include a 14-day free trial. No credit card required.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { name: 'Connect', price: '$49', featured: false, cta: 'Get Started →', features: ['Status monitoring via Telegram', 'Remote ATEM + OBS + Companion control', 'Pre-service automated checklist', 'Screenshot preview', 'Email support'] },
              { name: 'Pro', price: '$149', featured: true, cta: 'Get Started →', features: ['Everything in Connect', 'Live video monitoring feed', 'Active monitoring during Sunday services', 'Real-time intervention', 'Post-service report', 'Priority support'] },
              { name: 'Managed', price: '$299', featured: false, cta: 'Contact Us →', features: ['Everything in Pro', 'Hardware installation included', 'Weekly system health check', 'Annual system audit', 'Direct line to Andrew'] },
            ].map((plan, i) => (
              <div key={i} style={{ background: plan.featured ? 'rgba(232,76,61,0.1)' : 'rgba(255,255,255,0.05)', border: plan.featured ? `2px solid ${RED}` : '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, position: 'relative' }}>
                {plan.featured && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: RED, color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 4 }}>{plan.price}<span style={{ fontSize: '1rem', fontWeight: 400, color: '#94a3b8' }}>/mo</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0' }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ padding: '6px 0', color: '#cbd5e1', fontSize: '0.9rem' }}>✓ {f}</li>
                  ))}
                </ul>
                <a href="#early-access" style={{ ...btn(plan.featured ? RED : 'transparent', '#fff', plan.featured ? undefined : `2px solid rgba(255,255,255,0.3)`), display: 'block', textAlign: 'center' }}>{plan.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EARLY ACCESS */}
      <section id="early-access" style={{ background: '#fff', padding: '80px 5%' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Get early access</h2>
          <p style={{ color: '#64748b', marginBottom: 32 }}>We're onboarding the first 20 churches now. Early access members get 3 months free.</p>
          {submitted ? (
            <div style={{ background: '#f0fdf4', border: `1px solid ${GREEN}`, borderRadius: 12, padding: 32 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
              <p style={{ fontWeight: 600, margin: 0 }}>You're on the list. We'll be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'name', placeholder: 'Your name', type: 'text', required: true },
                { key: 'church', placeholder: 'Church name', type: 'text' },
                { key: 'email', placeholder: 'Email address', type: 'email', required: true },
              ].map((f) => (
                <input key={f.key} type={f.type} placeholder={f.placeholder} required={f.required}
                  value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }} />
              ))}
              <button type="submit" disabled={submitting} style={{ ...btn(RED, '#fff'), border: 'none', fontSize: '1rem', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Submitting...' : 'Request Early Access →'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '32px 5%', textAlign: 'center' }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>Tally by ATEM School</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', fontSize: '0.9rem', marginBottom: 16 }}>
          <a href="https://atemschool.com" target="_blank" rel="noopener" style={{ color: '#64748b', textDecoration: 'none' }}>atemschool.com</a>
          <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</a>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>© 2026 ATEM School. Built for church production teams.</p>
      </footer>
    </div>
  );
}
