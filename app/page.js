'use client';
import { useState } from 'react';

/* ─── Color tokens ─── */
const BG       = '#09090B';
const CARD_BG  = '#0F1613';
const BORDER   = '#1a2e1f';
const GREEN    = '#22c55e';
const GREEN_LT = '#4ade80';
const WHITE    = '#F8FAFC';
const MUTED    = '#94A3B8';
const DIM      = '#475569';

/* ─── Data ─── */
const FEATURES = [
  { icon: '🔴', name: 'Stream Goes Down — Tally Fixes It',  desc: 'Auto-recovery restarts your stream before the congregation even notices' },
  { icon: '📱', name: 'TD Gets Paged Instantly',            desc: 'Alert hits their phone in seconds — not after someone in the lobby complains' },
  { icon: '✅', name: 'Pre-Service System Check',           desc: 'Automated green-light 30 min before every service. No more manual checks.' },
  { icon: '🎛️', name: 'Control From Anywhere',              desc: 'Cut cameras, advance slides, mute channels — all from Telegram on your phone' },
  { icon: '📊', name: 'Monthly Reports For Leadership',     desc: 'Uptime stats, incidents, and auto-recoveries. Justify the tech budget easily.' },
  { icon: '🤝', name: 'Built For Multi-Site',               desc: 'One dashboard for every campus. Andrew supports 20+ churches from his desk.' },
];

const INTEGRATIONS = [
  { name: 'ATEM Switcher',       tag: 'SWITCHER'  },
  { name: 'OBS Studio',          tag: 'STREAMING' },
  { name: 'vMix',                tag: 'STREAMING' },
  { name: 'Bitfocus Companion',  tag: 'CONTROL'   },
  { name: 'ProPresenter',        tag: 'SLIDES'    },
  { name: 'Resolume Arena',      tag: 'VIDEO WALL'},
  { name: 'Allen & Heath',       tag: 'AUDIO'     },
  { name: 'Behringer X32',       tag: 'AUDIO'     },
  { name: 'Midas M32',           tag: 'AUDIO'     },
  { name: 'Yamaha CL/QL',        tag: 'AUDIO'     },
  { name: 'HyperDeck',           tag: 'RECORD'    },
  { name: 'PTZ Cameras',         tag: 'CAMERA'    },
  { name: 'Video Hub',           tag: 'ROUTER'    },
  { name: 'Dante Audio',         tag: 'AUDIO'     },
];

const STEPS = [
  {
    num: '01',
    title: 'Install',
    desc: '10-minute setup. Run the app on your booth computer. It auto-discovers your ATEM, OBS, and Companion.',
  },
  {
    num: '02',
    title: 'Connect',
    desc: 'Your church appears live on the Tally dashboard. Every device, every status — instantly visible.',
  },
  {
    num: '03',
    title: 'Relax',
    desc: 'Tally watches your entire production. If something breaks, it fixes it first — then tells you.',
  },
];

const PRICING = [
  {
    name: 'Connect',
    price: '$49',
    period: '/mo',
    desc: 'For churches that want monitoring and alerts — no Andrew time required.',
    featured: false,
    cta: 'Get Early Access →',
    features: [
      'ATEM, OBS, Companion monitoring',
      'Pre-service automated check',
      'Stream health + audio silence alerts',
      'Telegram remote control',
      'Auto-recovery playbook',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$149',
    period: '/mo',
    desc: 'All 14 integrations, Planning Center sync, and active monitoring during services.',
    featured: true,
    cta: 'Get Early Access →',
    features: [
      'Everything in Connect',
      'All 14 device integrations',
      'ProPresenter + audio console control',
      'Planning Center schedule sync',
      'On-call TD rotation',
      'Monthly health report PDF',
      'Priority support',
    ],
  },
  {
    name: 'Managed',
    price: '$299',
    period: '/mo',
    desc: 'Andrew handles everything — setup, config changes, and a 15-min response SLA.',
    featured: false,
    cta: 'Contact Andrew →',
    features: [
      'Everything in Pro',
      'Andrew handles setup & config',
      'Remote configuration changes',
      'Weekly system health review',
      '15-minute response SLA',
      'Direct line to Andrew',
    ],
  },
];

const SCROLL_DEVICES = [
  'ATEM', 'OBS', 'vMix', 'Companion', 'ProPresenter',
  'Resolume', 'X32', 'Allen & Heath', 'Yamaha', 'HyperDeck', 'PTZ',
];

/* ─── Component ─── */
export default function Home() {
  const [form, setForm]           = useState({ name: '', church: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res  = await fetch('/api/early-access', {
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
    <div style={{ background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", overflowX: 'hidden' }}>

      {/* ─── Global styles ─── */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 30px rgba(34,197,94,0.15); }
          50%       { box-shadow: 0 0 60px rgba(34,197,94,0.28); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }
        .integration-card:hover {
          border-color: ${GREEN} !important;
          box-shadow: 0 0 20px rgba(34,197,94,0.1);
        }
        .feature-card:hover {
          border-color: ${GREEN} !important;
          box-shadow: 0 0 20px rgba(34,197,94,0.1);
        }
        .price-card-default:hover {
          border-color: ${GREEN} !important;
        }
        .cta-ghost:hover {
          border-color: ${GREEN} !important;
          color: ${GREEN_LT} !important;
        }
        .nav-link:hover { color: ${WHITE} !important; }
        .footer-link:hover { color: ${MUTED} !important; }
        .app-tab-btn {
          transition: all 0.2s;
        }
        .app-tab-btn:hover {
          color: ${WHITE} !important;
        }
      `}</style>

      {/* ════════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 5%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 8px ${GREEN}` }} />
          <span style={{ color: WHITE, fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>Tally</span>
          <span style={{ color: DIM, fontSize: '0.82rem', marginLeft: 2 }}>by ATEM School</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#features"    className="nav-link" style={{ color: MUTED, textDecoration: 'none', fontSize: '0.88rem', transition: 'color .2s' }}>Features</a>
          <a href="#the-app"     className="nav-link" style={{ color: MUTED, textDecoration: 'none', fontSize: '0.88rem', transition: 'color .2s' }}>The App</a>
          <a href="#pricing"     className="nav-link" style={{ color: MUTED, textDecoration: 'none', fontSize: '0.88rem', transition: 'color .2s' }}>Pricing</a>
          <a href="#early-access" style={{
            display: 'inline-block', padding: '9px 22px', fontSize: '0.88rem', fontWeight: 700,
            borderRadius: 8, border: 'none', background: GREEN, color: '#000', cursor: 'pointer',
            textDecoration: 'none',
          }}>Get Early Access</a>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '140px 5% 0', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(34,197,94,0.08) 0%, transparent 70%)',
        }} />

        {/* badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(34,197,94,0.08)', border: `1px solid rgba(34,197,94,0.25)`,
          borderRadius: 20, padding: '6px 16px', marginBottom: 36,
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.12em', color: GREEN,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 6px ${GREEN}` }} />
          TALLY BY ATEM SCHOOL — EARLY ACCESS
        </div>

        {/* headline */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 7vw, 5rem)', fontWeight: 900,
          lineHeight: 1.05, margin: '0 auto 28px', letterSpacing: '-0.03em',
          color: WHITE, maxWidth: 960,
        }}>
          YOUR CHURCH PRODUCTION SYSTEM.<br />
          <span style={{ color: GREEN }}>IN YOUR POCKET.</span>
        </h1>

        {/* subtext */}
        <p style={{
          fontSize: 'clamp(1rem, 2.2vw, 1.25rem)', color: MUTED,
          maxWidth: 660, margin: '0 auto 20px', lineHeight: 1.7,
        }}>
          Tally monitors every device in your booth — ATEM, OBS, audio, slides — and fixes problems before the congregation notices.
          You get an alert. Everything else is automatic.
        </p>

        {/* social proof line */}
        <p style={{
          color: DIM, fontSize: '0.9rem', margin: '0 auto 52px',
          fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em',
        }}>
          Built by a 15-year broadcast engineer who&apos;s been in your booth.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
          <a href="#early-access" style={{
            display: 'inline-block', padding: '15px 36px', fontSize: '1rem', fontWeight: 700,
            borderRadius: 8, border: 'none', background: GREEN, color: '#000',
            cursor: 'pointer', textDecoration: 'none',
          }}>
            Get Early Access — Free for 60 Days →
          </a>
          <a href="#the-app" className="cta-ghost" style={{
            display: 'inline-block', padding: '15px 36px', fontSize: '1rem', fontWeight: 600,
            borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent',
            color: MUTED, cursor: 'pointer', textDecoration: 'none', transition: 'border-color .2s, color .2s',
          }}>
            See the App ↓
          </a>
        </div>

        {/* scrolling device strip */}
        <div style={{
          width: '100%', overflow: 'hidden',
          borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
          padding: '18px 0',
        }}>
          <div className="marquee-track">
            {[...SCROLL_DEVICES, ...SCROLL_DEVICES].map((name, i) => (
              <span key={i} style={{
                fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem',
                color: DIM, letterSpacing: '0.08em', padding: '0 28px',
                whiteSpace: 'nowrap',
              }}>
                {name} <span style={{ color: BORDER, marginLeft: 28 }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          THE PROBLEM
      ════════════════════════════════════════ */}
      <section style={{
        padding: '128px 5%',
        background: CARD_BG,
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.15em', color: GREEN, marginBottom: 28,
          }}>THE PROBLEM</p>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-0.03em', color: WHITE,
            margin: '0 0 40px',
          }}>
            Sunday morning is the worst time<br />to discover something is broken.
          </h2>

          <p style={{ color: MUTED, fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 48, maxWidth: 680, margin: '0 auto 48px' }}>
            The stream dies. Recording never started. ProPresenter crashed. Your TD is scrambling.
            Meanwhile 500 people — and your YouTube audience — are staring at a black screen.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}>
            {[
              { stat: '73%', label: 'of church stream failures go unnoticed for 3+ minutes' },
              { stat: '2×', label: 'more likely to retain remote viewers with zero-downtime streams' },
              { stat: '< 90s', label: 'Tally average detection-to-recovery time' },
            ].map((item, i) => (
              <div key={i} style={{
                background: BG, border: `1px solid ${BORDER}`,
                borderRadius: 16, padding: '28px 24px', textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '2.8rem', fontWeight: 900, color: GREEN,
                  letterSpacing: '-0.03em', marginBottom: 10,
                }}>{item.stat}</div>
                <div style={{ color: MUTED, fontSize: '0.88rem', lineHeight: 1.6 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section id="features" style={{ padding: '128px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
            textAlign: 'center', marginBottom: 20,
          }}>WHAT TALLY DOES</p>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 64px',
            color: WHITE, maxWidth: 700,
          }}>
            Fixes the problems you haven&apos;t had yet.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{
                background: CARD_BG, border: `1px solid ${BORDER}`,
                borderRadius: 16, padding: '32px 28px',
                transition: 'border-color .2s, box-shadow .2s',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 10px', color: WHITE }}>{f.name}</h3>
                <p style={{ color: MUTED, margin: 0, fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          THE APP — Screenshot showcase
      ════════════════════════════════════════ */}
      <section id="the-app" style={{
        padding: '128px 5%',
        background: CARD_BG,
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
            textAlign: 'center', marginBottom: 20,
          }}>THE APP</p>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 16px',
            color: WHITE,
          }}>
            See exactly what&apos;s happening.<br />From anywhere.
          </h2>
          <p style={{
            color: MUTED, textAlign: 'center', fontSize: '1rem',
            maxWidth: 560, margin: '0 auto 64px', lineHeight: 1.7,
          }}>
            The Tally client installs on your booth computer in minutes.
            Your TD sees every device status at a glance — and you see every church from your phone.
          </p>

          {/* Tab selector */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 32,
          }}>
            <div style={{
              display: 'inline-flex',
              background: BG, border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: 4, gap: 4,
            }}>
              {[
                { id: 'status',    label: '📊  Status View' },
                { id: 'equipment', label: '⚙️  Equipment Setup' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className="app-tab-btn"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '10px 22px', border: 'none', borderRadius: 7,
                    fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'all .2s',
                    background: activeTab === tab.id ? GREEN : 'transparent',
                    color: activeTab === tab.id ? '#000' : MUTED,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Screenshot frame */}
          <div style={{
            position: 'relative',
            borderRadius: 16,
            border: `1px solid ${activeTab === 'status' ? GREEN : BORDER}`,
            overflow: 'hidden',
            boxShadow: activeTab === 'status'
              ? '0 0 60px rgba(34,197,94,0.18), 0 32px 80px rgba(0,0,0,0.6)'
              : '0 0 30px rgba(34,197,94,0.06), 0 32px 80px rgba(0,0,0,0.6)',
            transition: 'box-shadow .3s, border-color .3s',
            animation: 'glow-pulse 3s ease-in-out infinite',
          }}>
            {/* Window chrome bar */}
            <div style={{
              background: '#0d1117',
              padding: '12px 18px',
              borderBottom: `1px solid ${BORDER}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{
                marginLeft: 12, fontSize: '0.78rem',
                fontFamily: 'ui-monospace, monospace', color: DIM,
              }}>
                Tally by ATEM School — {activeTab === 'status' ? 'Main Sanctuary' : 'Equipment Configuration'}
              </span>
            </div>
            <img
              src={activeTab === 'status' ? '/app-status.png' : '/app-equipment.png'}
              alt={activeTab === 'status' ? 'Tally status dashboard' : 'Tally equipment setup'}
              style={{ width: '100%', display: 'block' }}
            />
          </div>

          {/* Caption */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16, marginTop: 32,
          }}>
            {(activeTab === 'status' ? [
              { icon: '🔴', label: 'LIVE badge', desc: 'Instantly see if the stream is active' },
              { icon: '🟢', label: 'All green', desc: 'Relay, ATEM, OBS, Companion — all connected' },
              { icon: '📹', label: 'Program & Preview', desc: 'Which camera is live, which is up next' },
            ] : [
              { icon: '🎛️', label: 'Auto-discovers devices', desc: 'Hit Scan Network — it finds your ATEM, OBS, Companion automatically' },
              { icon: '⚙️', label: 'One-time setup', desc: 'Enter IPs once, test connections, save — done in 10 minutes' },
              { icon: '🔒', label: 'Encrypted credentials', desc: 'Stream keys stored in your OS keychain. Never plaintext.' },
            ]).map((item, i) => (
              <div key={i} style={{
                background: BG, border: `1px solid ${BORDER}`,
                borderRadius: 12, padding: '18px 20px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: WHITE, fontSize: '0.9rem', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: MUTED, fontSize: '0.82rem', lineHeight: 1.55 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BOLD STATEMENT
      ════════════════════════════════════════ */}
      <section style={{
        padding: '128px 5%',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(34,197,94,0.05) 0%, transparent 65%)',
        }} />
        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
          <p style={{
            fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 900,
            lineHeight: 0.95, letterSpacing: '-0.04em', color: WHITE, margin: '0 0 4px',
          }}>ONE DASHBOARD.</p>
          <p style={{
            fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 900,
            lineHeight: 0.95, letterSpacing: '-0.04em', color: GREEN, margin: '0 0 4px',
          }}>EVERY CHURCH.</p>
          <p style={{
            fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 900,
            lineHeight: 0.95, letterSpacing: '-0.04em', color: WHITE, margin: '0 0 48px',
          }}>ANYWHERE.</p>
          <p style={{ color: MUTED, fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.7 }}>
            Whether you&apos;re managing one venue or twenty, Tally keeps every production under control — without you being in the room.
          </p>
          <a href="#early-access" style={{
            display: 'inline-block', padding: '15px 40px', fontSize: '1rem', fontWeight: 700,
            borderRadius: 8, border: 'none', background: GREEN, color: '#000',
            cursor: 'pointer', textDecoration: 'none',
          }}>
            Start Free — 60 Days →
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════════
          INTEGRATIONS
      ════════════════════════════════════════ */}
      <section style={{
        padding: '128px 5%',
        background: CARD_BG,
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
            textAlign: 'center', marginBottom: 20,
          }}>INTEGRATIONS</p>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 64px',
            color: WHITE,
          }}>
            WORKS WITH EVERYTHING<br />IN YOUR RACK
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 12,
          }}>
            {INTEGRATIONS.map((d, i) => (
              <div key={i} className="integration-card" style={{
                background: BG, border: `1px solid ${BORDER}`,
                borderRadius: 12, padding: '20px 16px',
                transition: 'border-color .2s, box-shadow .2s',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <span style={{ fontWeight: 700, color: WHITE, fontSize: '0.88rem', lineHeight: 1.3 }}>{d.name}</span>
                <span style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem',
                  fontWeight: 700, letterSpacing: '0.1em', color: GREEN,
                }}>{d.tag}</span>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: 'center', color: DIM, fontSize: '0.9rem',
            marginTop: 36, fontStyle: 'italic',
          }}>
            If it&apos;s in your booth, Tally monitors it.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '128px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
            textAlign: 'center', marginBottom: 20,
          }}>HOW IT WORKS</p>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 80px',
            color: WHITE,
          }}>Three steps. Ten minutes.</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 0, position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 28, left: '16.66%', right: '16.66%',
              height: 1, background: BORDER, zIndex: 0,
            }} />

            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 32px 0', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: BG, border: `2px solid ${GREEN}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 28px',
                  fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem',
                  fontWeight: 800, color: GREEN,
                  boxShadow: `0 0 20px rgba(34,197,94,0.15)`,
                }}>{s.num}</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 14px', color: WHITE, letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ color: MUTED, margin: 0, fontSize: '0.95rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRICING
      ════════════════════════════════════════ */}
      <section id="pricing" style={{
        padding: '128px 5%',
        background: CARD_BG,
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
            textAlign: 'center', marginBottom: 20,
          }}>PRICING</p>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 12px',
            color: WHITE,
          }}>Simple, honest pricing.</h2>
          <p style={{ color: DIM, textAlign: 'center', marginBottom: 64, fontSize: '0.95rem' }}>
            60-day free trial for every early access church. Cancel anytime.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16, marginBottom: 32,
          }}>
            {PRICING.map((plan, i) => (
              <div key={i} className={plan.featured ? '' : 'price-card-default'} style={{
                background: plan.featured ? 'rgba(34,197,94,0.06)' : BG,
                border: plan.featured ? `2px solid ${GREEN}` : `1px solid ${BORDER}`,
                borderRadius: 16, padding: '36px 28px',
                position: 'relative',
                transition: plan.featured ? undefined : 'border-color .2s',
                boxShadow: plan.featured ? '0 0 40px rgba(34,197,94,0.08)' : undefined,
              }}>
                {plan.featured && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: GREEN, color: '#000', padding: '4px 18px',
                    borderRadius: 20, fontSize: '0.7rem', fontWeight: 800,
                    letterSpacing: '0.08em', whiteSpace: 'nowrap',
                    fontFamily: 'ui-monospace, monospace',
                  }}>MOST POPULAR</div>
                )}

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', color: WHITE }}>{plan.name}</h3>
                <p style={{ color: DIM, fontSize: '0.82rem', margin: '0 0 24px', lineHeight: 1.5 }}>{plan.desc}</p>

                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: WHITE, letterSpacing: '-0.03em' }}>{plan.price}</span>
                  <span style={{ fontSize: '0.95rem', color: DIM }}>{plan.period}</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{
                      padding: '8px 0', color: MUTED, fontSize: '0.88rem',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      borderBottom: `1px solid ${BORDER}`,
                    }}>
                      <span style={{ color: GREEN, flexShrink: 0, marginTop: 1, fontSize: '0.8rem' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a href="#early-access" style={{
                  display: 'block', textAlign: 'center',
                  padding: '13px 24px', fontSize: '0.95rem', fontWeight: 700,
                  borderRadius: 8, textDecoration: 'none',
                  background: plan.featured ? GREEN : 'transparent',
                  color: plan.featured ? '#000' : WHITE,
                  border: plan.featured ? 'none' : `1px solid ${BORDER}`,
                }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Event add-on */}
          <div style={{
            background: BG, border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: '24px 28px',
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}>
            <div style={{
              fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem',
              fontWeight: 700, letterSpacing: '0.1em', color: GREEN,
              background: 'rgba(34,197,94,0.08)', border: `1px solid rgba(34,197,94,0.2)`,
              borderRadius: 6, padding: '4px 12px', whiteSpace: 'nowrap',
            }}>ONE-TIME</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <span style={{ fontWeight: 800, color: WHITE, fontSize: '1rem' }}>Event — $99</span>
              <span style={{ color: DIM, fontSize: '0.88rem', marginLeft: 12 }}>72-hour monitoring for conferences, Easter, weddings. No subscription.</span>
            </div>
            <a href="#early-access" style={{
              padding: '10px 22px', fontSize: '0.88rem', fontWeight: 700,
              borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent',
              color: WHITE, textDecoration: 'none', whiteSpace: 'nowrap',
            }}>Book an Event →</a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BUILT BY ANDREW
      ════════════════════════════════════════ */}
      <section style={{ padding: '128px 5%' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 24, padding: '52px 48px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -40, right: -40, width: 200, height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <p style={{
              fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
              fontWeight: 700, letterSpacing: '0.15em', color: GREEN, marginBottom: 24,
            }}>WHY I BUILT THIS</p>
            <blockquote style={{
              fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)', color: WHITE,
              lineHeight: 1.75, margin: '0 0 32px', fontStyle: 'italic',
              borderLeft: `3px solid ${GREEN}`, paddingLeft: 24,
            }}>
              &ldquo;I&apos;ve spent 15 years inside church broadcast booths — from small community churches to 
              multi-site campuses. Stream failures are embarrassing. Missed recordings are unrecoverable. 
              I built Tally because I wanted to sleep on Saturday night knowing Sunday would be fine.&rdquo;
            </blockquote>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: `linear-gradient(135deg, ${GREEN}, #16a34a)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1.1rem', color: '#000',
                flexShrink: 0,
              }}>A</div>
              <div>
                <div style={{ fontWeight: 800, color: WHITE, fontSize: '0.95rem' }}>Andrew Disbrow</div>
                <div style={{ color: DIM, fontSize: '0.82rem' }}>Broadcast Engineer · Founder, ATEM School</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          EARLY ACCESS FORM
      ════════════════════════════════════════ */}
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
            }}>EARLY ACCESS — LIMITED SPOTS</p>

            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900,
              letterSpacing: '-0.03em', margin: '0 0 16px', color: WHITE,
            }}>JOIN THE FOUNDING CHURCHES.</h2>

            <p style={{ color: MUTED, marginBottom: 16, lineHeight: 1.7, fontSize: '1rem' }}>
              Early access churches get 60 days free, locked-in pricing, and direct access to Andrew during onboarding.
            </p>
            <p style={{ color: DIM, marginBottom: 48, lineHeight: 1.7, fontSize: '0.9rem' }}>
              No credit card required. Setup takes 10 minutes.
            </p>

            {submitted ? (
              <div style={{
                background: 'rgba(34,197,94,0.06)', border: `1px solid rgba(34,197,94,0.25)`,
                borderRadius: 16, padding: 48,
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🎉</div>
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
                    Something went wrong — email{' '}
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
                  {submitting ? 'Sending...' : 'Request Early Access — Free for 60 Days →'}
                </button>

                <p style={{ color: DIM, fontSize: '0.82rem', margin: 0, marginTop: 4 }}>
                  Limited spots. No credit card. Cancel anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer style={{
        background: '#060608', borderTop: `1px solid ${BORDER}`,
        padding: '40px 5%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 6px ${GREEN}` }} />
          <span style={{ color: WHITE, fontWeight: 800, fontSize: '0.95rem' }}>TALLY</span>
          <span style={{ color: DIM, fontSize: '0.82rem' }}>· by ATEM School</span>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', flexWrap: 'wrap' }}>
          <a href="https://tally.atemschool.com" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>tally.atemschool.com</a>
          <a href="https://atemschool.com" target="_blank" rel="noopener" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>atemschool.com ↗</a>
        </div>
      </footer>

    </div>
  );
}
