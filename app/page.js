'use client';
import { useState } from 'react';

const RED = '#E84C3D';
const DARK = '#0f172a';
const DARK2 = '#1e293b';
const GREEN = '#22c55e';

/* ─── tiny style helpers ─── */
const btn = (bg, color, border) => ({
  display: 'inline-block', padding: '14px 32px', fontSize: '1rem', fontWeight: 600,
  borderRadius: 8, border: border || 'none', background: bg, color, cursor: 'pointer',
  textDecoration: 'none', transition: 'opacity .2s',
});

const card = (extra = {}) => ({
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: 28,
  ...extra,
});

/* ─── data ─── */
const DEVICES = [
  { icon: '🎛️', name: 'Blackmagic ATEM', sub: 'Any model' },
  { icon: '🔴', name: 'OBS Studio', sub: 'All platforms' },
  { icon: '🎬', name: 'vMix', sub: 'Windows' },
  { icon: '🕹️', name: 'Bitfocus Companion', sub: '600+ devices' },
  { icon: '💾', name: 'HyperDeck', sub: 'Record control' },
  { icon: '📹', name: 'PTZ Cameras', sub: 'IP control' },
  { icon: '🖥️', name: 'ProPresenter 7', sub: 'Slide control' },
  { icon: '🌈', name: 'Resolume Arena', sub: 'LED / projection' },
  { icon: '🎚️', name: 'Allen & Heath', sub: 'SQ / dLive' },
  { icon: '🎛️', name: 'Behringer', sub: 'X32 / X-Air' },
  { icon: '🎛️', name: 'Midas', sub: 'M32 / M32R' },
  { icon: '🎵', name: 'Yamaha', sub: 'CL / QL / TF' },
  { icon: '🔀', name: 'Video Hub', sub: 'BM router' },
  { icon: '🔊', name: 'Dante Audio', sub: 'Via Companion' },
];

const FEATURES = [
  {
    icon: '✅',
    title: 'Pre-Service Auto-Check',
    desc: '30 minutes before service, Tally runs a full system check and sends your TD a green/red summary. No more "I thought someone else checked the stream."',
  },
  {
    icon: '🔇',
    title: 'Audio Silence Detection',
    desc: 'Tally listens for audio silence and dropouts — and alerts you before the congregation notices dead air. Works across ATEM, audio consoles, and recording devices.',
  },
  {
    icon: '🛡️',
    title: 'Weekend Protection',
    desc: 'On-call TD rotation means TD1 is responsible this week, TD2 next week. Escalation ladder: alert goes to the on-call TD first, then to Andrew after 90 seconds.',
  },
  {
    icon: '📊',
    title: 'Monthly Health Report',
    desc: 'Every church gets a monthly PDF: uptime, incidents, response times, devices checked. Leadership can see the value. Budget conversations get easier.',
  },
];

const PERSONAS = [
  {
    icon: '⛪',
    title: 'Churches with volunteer TDs',
    desc: 'Your TD changes every few weeks. Tally keeps the system consistent — pre-service checks, escalation ladders, and guest TD tokens so substitutes can jump in without a tutorial.',
  },
  {
    icon: '🏢',
    title: 'Production companies',
    desc: 'Managing 5 venues means 5 Sunday mornings at once. Tally gives you one dashboard across all of them — with per-venue alerts and monthly reports for every client.',
  },
  {
    icon: '🔧',
    title: 'Broadcast integrators',
    desc: 'You sold them the system. Now they call you at 10:47 AM. Tally lets you see, diagnose, and fix the problem from your phone — before you even get in the car.',
  },
];

const PRICING = [
  {
    name: 'Connect',
    price: '$49',
    featured: false,
    cta: 'Get Early Access →',
    desc: '1 church. Monitoring + alerts, basic device support.',
    features: [
      'ATEM, OBS, Companion monitoring',
      'Pre-service auto-check',
      'Stream health alerts',
      'Audio silence detection',
      'Telegram remote control',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$149',
    featured: true,
    cta: 'Get Early Access →',
    desc: 'Unlimited churches. Every integration.',
    features: [
      'Everything in Connect',
      'All 14 device integrations',
      'On-call TD rotation',
      'Guest TD 24-hour tokens',
      'Monthly health report PDF',
      'Auto-recovery playbook',
      'Priority support',
    ],
  },
  {
    name: 'Managed',
    price: '$299',
    featured: false,
    cta: 'Contact Andrew →',
    desc: 'Everything in Pro + Andrew handles it.',
    features: [
      'Everything in Pro',
      'Andrew handles setup + config',
      'Remote configuration changes',
      'Weekly system health review',
      'Annual system audit',
      'Direct line to Andrew',
    ],
  },
];

/* ─── component ─── */
export default function Home() {
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
    <div style={{ background: DARK, color: '#e2e8f0', fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 5%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 8px ${GREEN}` }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>Tally</span>
          <span style={{ color: '#475569', fontSize: '0.85rem', marginLeft: 4 }}>by ATEM School</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>How it works</a>
          <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</a>
          <a href="#early-access" style={{ ...btn(RED, '#fff'), padding: '8px 20px', fontSize: '0.9rem' }}>Get Early Access</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '160px 5% 100px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(232,76,61,0.1)', border: `1px solid rgba(232,76,61,0.3)`,
          borderRadius: 20, padding: '6px 16px', fontSize: '0.8rem',
          color: '#fca5a5', marginBottom: 32, fontWeight: 600,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED, display: 'inline-block', animation: 'pulse 2s infinite' }} />
          NOW IN EARLY ACCESS — FIRST 20 CHURCHES GET 3 MONTHS FREE
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900,
          lineHeight: 1.08, margin: '0 auto 24px', letterSpacing: '-0.02em',
          color: '#f8fafc',
        }}>
          Your church production system,<br />
          <span style={{ color: RED }}>monitored and controlled</span><br />
          from anywhere.
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: '#94a3b8', maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.6 }}>
          So Sunday mornings don&apos;t require you to be everywhere.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <a href="#early-access" style={btn(RED, '#fff')}>Get Early Access →</a>
          <a href="#how-it-works" style={btn('transparent', '#cbd5e1', '2px solid rgba(255,255,255,0.15)')}>See How It Works</a>
        </div>

        {/* device compatibility strip */}
        <p style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
          Works with
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {['ATEM', 'OBS', 'vMix', 'Companion', 'ProPresenter', 'Resolume', 'X32', 'HyperDeck', 'PTZ'].map(name => (
            <span key={name} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, padding: '4px 12px', fontSize: '0.8rem', color: '#94a3b8',
            }}>{name}</span>
          ))}
          <span style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '4px 12px', fontSize: '0.8rem', color: '#94a3b8',
          }}>+5 more</span>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section style={{ padding: '80px 5%', maxWidth: 800, margin: '0 auto' }}>
        <p style={{ color: RED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', marginBottom: 16 }}>
          The problem
        </p>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 32, color: '#f8fafc' }}>
          It&apos;s 10:47 AM on Sunday.<br />Your stream just dropped.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.75 }}>
          <p style={{ margin: 0 }}>
            The volunteer TD on camera doesn&apos;t know what happened. The worship leader is on stage. The senior pastor&apos;s phone is in his pocket. And somewhere, the person who built this system — maybe you — is getting a panicked call they can&apos;t ignore.
          </p>
          <p style={{ margin: 0 }}>
            Most church production systems are reactive by design. Something breaks, someone notices, someone calls someone else. If that chain of people happens to be in the right place, you recover in 3 minutes. If not, you lose the stream for the whole service — and half your online congregation.
          </p>
          <p style={{ margin: 0 }}>
            Tally changes the model. Real-time monitoring catches problems before the congregation does. Auto-recovery handles the common failures automatically. And when something genuinely needs a human, it reaches the right person — not just whoever picks up first.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '80px 5%', background: DARK2 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ color: RED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', marginBottom: 16 }}>
            How it works
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 48, color: '#f8fafc' }}>
            Three steps. Five minutes.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                step: '01',
                title: 'Install',
                desc: 'Drop the Tally agent on the booth computer — Electron app or CLI, your choice. It discovers your devices automatically: ATEM, OBS, audio console, whatever\'s on the network.',
                detail: 'One-time 5-minute setup. No port forwarding required.',
              },
              {
                step: '02',
                title: 'Connect',
                desc: 'The agent phones home over an encrypted relay. Andrew\'s dashboard sees the system. Your TD gets a Telegram bot. Everything\'s live.',
                detail: 'JWT-authenticated relay. Credentials encrypted at rest (OS keychain / AES-256-GCM).',
              },
              {
                step: '03',
                title: 'Monitor',
                desc: 'Real-time alerts land in Telegram before anyone in the building notices. The pre-service auto-check gives your TD a green/red summary 30 minutes before service. Auto-recovery handles stream drops, low FPS, and recording failures automatically.',
                detail: 'You watch. Tally watches harder.',
              },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24,
                paddingBottom: 48, marginBottom: i < 2 ? 0 : 0,
                borderLeft: i < 2 ? '2px solid rgba(255,255,255,0.08)' : 'none',
                marginLeft: 28, paddingLeft: 32,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', left: -17, top: 4,
                  width: 32, height: 32, borderRadius: '50%',
                  background: DARK, border: `2px solid ${RED}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800, color: RED,
                }}>{s.step}</div>
                <div style={{ paddingLeft: 8 }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 10px', color: '#f8fafc' }}>{s.title}</h3>
                  <p style={{ color: '#94a3b8', margin: '0 0 10px', lineHeight: 1.65 }}>{s.desc}</p>
                  <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEVICE GRID ── */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color: RED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', marginBottom: 16, textAlign: 'center' }}>
            Integrations
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: '#f8fafc', textAlign: 'center' }}>
            Integrates with everything in your rack.
          </h2>
          <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 48, maxWidth: 560, margin: '0 auto 48px' }}>
            14 native integrations — video switchers, recorders, cameras, presentation software, mixers, and routers. If it&apos;s in a church production rack, Tally speaks its language.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}>
            {DEVICES.map((d, i) => (
              <div key={i} style={{
                ...card(),
                display: 'flex', flexDirection: 'column', gap: 6,
                padding: '20px 18px',
              }}>
                <span style={{ fontSize: '1.6rem' }}>{d.icon}</span>
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{d.name}</span>
                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{d.sub}</span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.85rem', marginTop: 24 }}>
            Plus anything reachable via Bitfocus Companion — 600+ devices with one integration.
          </p>
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ── */}
      <section style={{ padding: '80px 5%', background: DARK2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color: RED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', marginBottom: 16, textAlign: 'center' }}>
            Features
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 48, color: '#f8fafc', textAlign: 'center' }}>
            Built for the moments that matter most.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ ...card({ padding: 32 }) }}>
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px', color: '#f8fafc' }}>{f.title}</h3>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* remote control call-out */}
          <div style={{ marginTop: 20, ...card({ padding: 32 }), display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>📱</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px', color: '#f8fafc' }}>Full remote control via Telegram</h3>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: 1.65 }}>
                You don&apos;t need to be in the booth. Cut sources, fire transitions, run macros on the ATEM. Start/stop stream in OBS or vMix. Advance ProPresenter slides. Trigger Resolume columns. Mute audio channels, recall scenes, check fader levels. Press any Companion button.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
              {[
                '🎛️ ATEM cuts, transitions, macros',
                '🔴 OBS / vMix stream & scene control',
                '🖥️ ProPresenter slide advance/rewind',
                '🌈 Resolume columns, clips, blackout',
                '🎚️ Audio mute, scene recall, fader check',
                '🕹️ Companion button press — anything',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: '0.88rem' }}>
                  <span style={{ color: GREEN, fontSize: '0.7rem' }}>●</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color: RED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', marginBottom: 16, textAlign: 'center' }}>
            Who it&apos;s for
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 48, color: '#f8fafc', textAlign: 'center' }}>
            If Sunday mornings stress you out, Tally is for you.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {PERSONAS.map((p, i) => (
              <div key={i} style={{ ...card({ padding: 32 }) }}>
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{p.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px', color: '#f8fafc' }}>{p.title}</h3>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '80px 5%', background: DARK2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color: RED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', marginBottom: 16, textAlign: 'center' }}>
            Pricing
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 8, color: '#f8fafc', textAlign: 'center' }}>
            Simple pricing. Cancel anytime.
          </h2>
          <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 48 }}>
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {PRICING.map((plan, i) => (
              <div key={i} style={{
                background: plan.featured ? 'rgba(232,76,61,0.08)' : 'rgba(255,255,255,0.03)',
                border: plan.featured ? `2px solid ${RED}` : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: 32, position: 'relative',
              }}>
                {plan.featured && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: RED, color: '#fff', padding: '4px 18px',
                    borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}>MOST POPULAR</div>
                )}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: '#f8fafc' }}>{plan.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 20px' }}>{plan.desc}</p>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1, marginBottom: 24, color: '#f8fafc' }}>
                  {plan.price}<span style={{ fontSize: '1rem', fontWeight: 400, color: '#64748b' }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ padding: '7px 0', color: '#94a3b8', fontSize: '0.88rem', display: 'flex', alignItems: 'flex-start', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: GREEN, flexShrink: 0, marginTop: 2 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#early-access" style={{
                  ...btn(plan.featured ? RED : 'transparent', '#fff', plan.featured ? undefined : '2px solid rgba(255,255,255,0.15)'),
                  display: 'block', textAlign: 'center',
                }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARLY ACCESS FORM ── */}
      <section id="early-access" style={{ padding: '100px 5%' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: RED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', marginBottom: 16 }}>
            Early access
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 12, color: '#f8fafc' }}>
            Get on the list.
          </h2>
          <p style={{ color: '#64748b', marginBottom: 40, lineHeight: 1.65 }}>
            We&apos;re onboarding the first 20 churches now. Early access members get 3 months free and direct input on the roadmap.
          </p>

          {submitted ? (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 16, padding: 40 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0 0 8px', color: '#f8fafc' }}>You&apos;re on the list!</p>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
                We&apos;ll be in touch within 24 hours. Check your email for confirmation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text" placeholder="First name" required
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: '1rem', outline: 'none' }}
              />
              <input
                type="text" placeholder="Church name"
                value={form.church} onChange={(e) => setForm({ ...form, church: e.target.value })}
                style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: '1rem', outline: 'none' }}
              />
              <input
                type="email" placeholder="Email address" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: '1rem', outline: 'none' }}
              />
              {error && (
                <p style={{ color: '#fca5a5', fontSize: '0.88rem', margin: 0 }}>
                  Something went wrong — email{' '}
                  <a href="mailto:andrew@atemschool.com" style={{ color: '#fca5a5' }}>andrew@atemschool.com</a>{' '}
                  directly.
                </p>
              )}
              <button
                type="submit" disabled={submitting}
                style={{
                  ...btn(RED, '#fff'), border: 'none', fontSize: '1rem',
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'wait' : 'pointer',
                  marginTop: 4,
                }}
              >
                {submitting ? 'Sending...' : 'Request Early Access →'}
              </button>
              <p style={{ color: '#475569', fontSize: '0.8rem', margin: 0 }}>
                No credit card required. We&apos;ll reach out personally.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#080f1a',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 5%',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 6px ${GREEN}` }} />
          <span style={{ color: '#e2e8f0', fontWeight: 700 }}>Tally</span>
          <span style={{ color: '#475569' }}>by ATEM School</span>
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', fontSize: '0.88rem', marginBottom: 20, flexWrap: 'wrap' }}>
          <a href="https://tally.atemschool.com" style={{ color: '#64748b', textDecoration: 'none' }}>tally.atemschool.com</a>
          <a href="https://atemschool.com" target="_blank" rel="noopener" style={{ color: '#64748b', textDecoration: 'none' }}>atemschool.com ↗</a>
          <a href="mailto:andrew@atemschool.com" style={{ color: '#64748b', textDecoration: 'none' }}>andrew@atemschool.com</a>
        </div>
        <p style={{ color: '#334155', fontSize: '0.78rem', margin: 0 }}>
          © 2026 ATEM School. Built for church production teams who care about Sunday.
        </p>
      </footer>

    </div>
  );
}
