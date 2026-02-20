import { CARD_BG, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';
import { FEATURES } from '../../lib/data';

export default function Features() {
  return (
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
              <div style={{
                display: 'inline-block', marginBottom: 20,
                fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem',
                fontWeight: 700, letterSpacing: '0.12em', color: GREEN,
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 4, padding: '4px 10px',
              }}>{f.tag}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 10px', color: WHITE }}>{f.name}</h3>
              <p style={{ color: MUTED, margin: 0, fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
