import { BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';
import { SCROLL_DEVICES } from '../../lib/data';

export default function Hero() {
  return (
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
        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: 20, padding: '6px 16px', marginBottom: 36,
        fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
        fontWeight: 700, letterSpacing: '0.12em', color: GREEN,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 6px ${GREEN}` }} />
        TALLY BY ATEM SCHOOL &mdash; CHURCH PRODUCTION MONITORING
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
        Tally monitors every device in your booth &mdash; ATEM, OBS, audio consoles, encoders, and presentations &mdash; fixes problems before the congregation notices, and gives your team AI-powered control from anywhere.
      </p>

      {/* social proof line */}
      <p style={{
        color: DIM, fontSize: '0.9rem', margin: '0 auto 52px',
        fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em',
      }}>
        23 integrations &middot; AI autopilot &middot; AI setup assistant &middot; 15 how-to guides.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
        <a href="/signup" style={{
          display: 'inline-block', padding: '15px 36px', fontSize: '1rem', fontWeight: 700,
          borderRadius: 8, border: 'none', background: GREEN, color: '#000',
          cursor: 'pointer', textDecoration: 'none',
        }}>
          Start Free &mdash; 30 Days &rarr;
        </a>
        <a href="#the-app" className="cta-ghost" style={{
          display: 'inline-block', padding: '15px 36px', fontSize: '1rem', fontWeight: 600,
          borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent',
          color: MUTED, cursor: 'pointer', textDecoration: 'none', transition: 'border-color .2s, color .2s',
        }}>
          See the App &darr;
        </a>
      </div>

      {/* scrolling device strip */}
      <div style={{
        width: '100%', overflow: 'hidden',
        borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
        padding: '18px 0',
      }}>
        <div className="marquee-track" aria-hidden="true">
          {[...SCROLL_DEVICES, ...SCROLL_DEVICES].map((name, i) => (
            <span key={i} style={{
              fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem',
              color: DIM, letterSpacing: '0.08em', padding: '0 28px',
              whiteSpace: 'nowrap',
            }}>
              {name} <span style={{ color: BORDER, marginLeft: 28 }}>&middot;</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
