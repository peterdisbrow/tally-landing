import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';
import { HARDWARE } from '../../lib/data';

const HIGHLIGHTS = [
  { icon: '\ud83d\udce1', label: 'Tailscale VPN', desc: 'Our team sees every box on a private network. No port forwarding, no firewall rules.' },
  { icon: '\ud83d\udd10', label: 'SSH Access', desc: 'Full remote shell for config changes, updates, and diagnostics \u2014 from anywhere.' },
  { icon: '\ud83c\udfa5', label: 'Live Preview', desc: '3Mbps H.264 stream routes over VPN. Watch your production in real time from anywhere.' },
];

export default function Hardware() {
  return (
    <section style={{
      padding: '128px 5%',
      borderTop: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>TALLY BOX</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 16px',
          color: WHITE,
        }}>Want zero-touch hardware?</h2>

        <p style={{
          color: MUTED, textAlign: 'center', fontSize: '1rem',
          maxWidth: 580, margin: '0 auto 64px', lineHeight: 1.7,
        }}>
          Pre-configured encoder boxes that plug into your ATEM aux output.
          Ships ready &mdash; no setup, no IT, no port forwarding.
          Managed remotely from day one.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16, marginBottom: 32,
        }}>
          {HARDWARE.map((hw, i) => (
            <div key={i} style={{
              background: hw.featured ? 'rgba(34,197,94,0.06)' : CARD_BG,
              border: hw.featured ? `2px solid ${GREEN}` : `1px solid ${BORDER}`,
              borderRadius: 16, padding: '36px 28px',
              position: 'relative',
              boxShadow: hw.featured ? '0 0 40px rgba(34,197,94,0.08)' : undefined,
            }}>
              {hw.featured && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: GREEN, color: '#000', padding: '4px 18px',
                  borderRadius: 20, fontSize: '0.7rem', fontWeight: 800,
                  letterSpacing: '0.08em', whiteSpace: 'nowrap',
                  fontFamily: 'ui-monospace, monospace',
                }}>BEST FOR MULTI-SITE</div>
              )}

              <div style={{
                display: 'inline-block', marginBottom: 16,
                fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem',
                fontWeight: 700, letterSpacing: '0.12em', color: GREEN,
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 4, padding: '4px 10px',
              }}>{hw.badge}</div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px', color: WHITE }}>{hw.name}</h3>
              <p style={{ color: DIM, fontSize: '0.88rem', margin: '0 0 24px', lineHeight: 1.6 }}>{hw.desc}</p>

              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 900, color: WHITE, letterSpacing: '-0.03em' }}>{hw.price}</span>
                <span style={{ fontSize: '0.9rem', color: DIM, marginLeft: 6 }}>{hw.period}</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                {hw.specs.map((s, j) => (
                  <li key={j} style={{
                    padding: '8px 0', color: MUTED, fontSize: '0.88rem',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    borderBottom: `1px solid ${BORDER}`,
                  }}>
                    <span style={{ color: GREEN, flexShrink: 0, marginTop: 1, fontSize: '0.8rem' }}>{'\u2713'}</span>
                    {s}
                  </li>
                ))}
              </ul>

              {hw.comingSoon ? (
                <div style={{
                  display: 'block', textAlign: 'center',
                  padding: '13px 24px', fontSize: '0.95rem', fontWeight: 700,
                  borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                  color: MUTED, border: `1px solid ${BORDER}`,
                  cursor: 'default',
                }}>Coming Soon</div>
              ) : (
                <a href={hw.ctaHref} style={{
                  display: 'block', textAlign: 'center',
                  padding: '13px 24px', fontSize: '0.95rem', fontWeight: 700,
                  borderRadius: 8, textDecoration: 'none',
                  background: hw.featured ? GREEN : 'transparent',
                  color: hw.featured ? '#000' : WHITE,
                  border: hw.featured ? 'none' : `1px solid ${BORDER}`,
                }}>{hw.cta}</a>
              )}
            </div>
          ))}
        </div>

        {/* What's inside callout */}
        <div style={{
          background: CARD_BG, border: `1px solid ${BORDER}`,
          borderRadius: 12, padding: '28px 32px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24,
        }}>
          {HIGHLIGHTS.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: WHITE, fontSize: '0.9rem', marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: MUTED, fontSize: '0.82rem', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Blackmagic reseller */}
        <div style={{
          background: CARD_BG, border: `1px solid ${BORDER}`,
          borderRadius: 12, padding: '24px 28px', marginTop: 24,
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: '0.1em', color: GREEN,
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 6, padding: '4px 12px', whiteSpace: 'nowrap',
          }}>AUTHORIZED RESELLER</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span style={{ fontWeight: 800, color: WHITE, fontSize: '1rem' }}>Blackmagic Design</span>
            <span style={{ color: DIM, fontSize: '0.88rem', marginLeft: 12 }}>Tally members get exclusive pricing on ATEM switchers, HyperDecks, and cameras.</span>
          </div>
          <a href="mailto:sales@atemschool.com?subject=Blackmagic%20Member%20Pricing" style={{
            padding: '10px 22px', fontSize: '0.88rem', fontWeight: 700,
            borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent',
            color: WHITE, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>Request a Quote &rarr;</a>
        </div>
      </div>
    </section>
  );
}
