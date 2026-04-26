import { CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';
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
                fontWeight: 700, letterSpacing: '0.12em',
                color: f.tag === 'COMING SOON' ? '#eab308' : GREEN,
                background: f.tag === 'COMING SOON' ? 'rgba(234,179,8,0.08)' : 'rgba(34,197,94,0.08)',
                border: f.tag === 'COMING SOON' ? '1px solid rgba(234,179,8,0.2)' : '1px solid rgba(34,197,94,0.2)',
                borderRadius: 4, padding: '4px 10px',
              }}>{f.tag}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 10px', color: WHITE }}>{f.name}</h3>
              <p style={{ color: MUTED, margin: 0, fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ color: DIM, fontSize: '0.9rem', marginBottom: 14 }}>
            Works with 25+ integrations across switchers, encoders, audio, and presentation software.
          </p>
          <a href="/hardware" style={{
            display: 'inline-block', padding: '12px 28px', fontSize: '0.9rem', fontWeight: 700,
            borderRadius: 8, textDecoration: 'none',
            border: `1px solid ${BORDER}`, background: 'transparent', color: WHITE,
            transition: 'border-color .2s',
          }}>View Compatible Hardware &rarr;</a>
        </div>
      </div>
    </section>
  );
}
