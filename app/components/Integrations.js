import { BG, CARD_BG, BORDER, GREEN, WHITE, DIM } from '../../lib/tokens';
import { INTEGRATIONS } from '../../lib/data';

export default function Integrations() {
  return (
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
          23 integrations and counting. If it&apos;s in your booth, Tally monitors it.
        </p>
      </div>
    </section>
  );
}
