import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';
import { PRICING } from '../../lib/data';

export default function Pricing() {
  return (
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
                    <span style={{ color: GREEN, flexShrink: 0, marginTop: 1, fontSize: '0.8rem' }}>{'\u2713'}</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a href={plan.ctaHref} style={{
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
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 6, padding: '4px 12px', whiteSpace: 'nowrap',
          }}>ONE-TIME</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span style={{ fontWeight: 800, color: WHITE, fontSize: '1rem' }}>Event &mdash; $99</span>
            <span style={{ color: DIM, fontSize: '0.88rem', marginLeft: 12 }}>72-hour monitoring for conferences, Easter, weddings. No subscription.</span>
          </div>
          <a href="mailto:andrew@atemschool.com" style={{
            padding: '10px 22px', fontSize: '0.88rem', fontWeight: 700,
            borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent',
            color: WHITE, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>Book an Event &rarr;</a>
        </div>
      </div>
    </section>
  );
}
