import { BG, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';
import { STEPS } from '../../lib/data';

export default function HowItWorks() {
  return (
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
                boxShadow: '0 0 20px rgba(34,197,94,0.15)',
              }}>{s.num}</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 14px', color: WHITE, letterSpacing: '-0.01em' }}>{s.title}</h3>
              <p style={{ color: MUTED, margin: 0, fontSize: '0.95rem', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
