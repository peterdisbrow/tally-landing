import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';

const STATS = [
  { stat: '3+ min', label: 'typical delay before someone notices a stream failure' },
  { stat: '10 min', label: 'setup \u2014 auto-discovers your ATEM, OBS, and 23 integrations' },
  { stat: '< 10s', label: 'Tally auto-recovery \u2014 stream back before anyone notices' },
];

export default function Problem() {
  return (
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
          Meanwhile 500 people &mdash; and your YouTube audience &mdash; are staring at a black screen.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {STATS.map((item, i) => (
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
  );
}
