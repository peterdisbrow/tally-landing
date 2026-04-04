import { CARD_BG, BORDER, GREEN, WHITE, DIM } from '../../lib/tokens';

export default function FounderQuote() {
  return (
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
          }}>WHY WE BUILT THIS</p>
          <blockquote style={{
            fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)', color: WHITE,
            lineHeight: 1.75, margin: '0 0 32px', fontStyle: 'italic',
            borderLeft: `3px solid ${GREEN}`, paddingLeft: 24,
          }}>
            &ldquo;We&apos;ve spent years inside church broadcast booths &mdash; from small community churches to
            multi-site campuses. Stream failures are embarrassing. Missed recordings are unrecoverable.
            We built Tally because we wanted church teams to sleep on Saturday night knowing Sunday would be fine.&rdquo;
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `linear-gradient(135deg, ${GREEN}, #16a34a)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.1rem', color: '#000',
              flexShrink: 0,
            }}>T</div>
            <div>
              <div style={{ fontWeight: 800, color: WHITE, fontSize: '0.95rem' }}>Tally Team</div>
              <div style={{ color: DIM, fontSize: '0.82rem' }}>Built by church production people</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
