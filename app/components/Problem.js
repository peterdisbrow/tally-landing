import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DANGER } from '../../lib/tokens';

const PAIN_POINTS = [
  'The stream drops mid-sermon — again',
  'Nobody notices the backup battery died — until it matters',
  'The new volunteer doesn\'t know which HDMI goes where',
  'You get the Monday morning text: \u201cThe recording didn\u2019t save\u201d',
];

const CAPABILITIES = [
  {
    title: 'Watches every signal path',
    body: 'Monitors HDMI, SDI, NDI, and network feeds. Knows when something drops before your congregation does.',
  },
  {
    title: 'Learns your setup',
    body: 'Maps your specific gear, connections, and routing. Alerts are tuned to YOUR environment, not generic defaults.',
  },
  {
    title: 'Guides your team',
    body: 'New volunteer? Tally shows them exactly what\u2019s connected, what\u2019s live, and what needs attention. Training built into the tool.',
  },
  {
    title: 'Never clocks out',
    body: '24/7 monitoring means you catch the Thursday night firmware update that would have killed Sunday\u2019s stream.',
  },
];

export default function Problem() {
  return (
    <>
      {/* ── Pain points ── */}
      <section style={{
        padding: '128px 5%',
        background: CARD_BG,
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.15em', color: DANGER, marginBottom: 28,
          }}>THE PROBLEM</p>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-0.03em', color: WHITE,
            margin: '0 0 48px',
          }}>
            Sunday morning shouldn&apos;t feel like this.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            textAlign: 'left',
          }}>
            {PAIN_POINTS.map((text, i) => (
              <div key={i} style={{
                background: BG,
                border: `1px solid ${BORDER}`,
                borderLeft: `3px solid ${DANGER}`,
                borderRadius: 12,
                padding: '20px 22px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
              }}>
                <span style={{
                  color: DANGER, fontSize: '1rem', lineHeight: 1,
                  flexShrink: 0, marginTop: 2,
                }}>✕</span>
                <span style={{ color: MUTED, fontSize: '0.95rem', lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution ── */}
      <section style={{
        padding: '128px 5%',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(34,197,94,0.04) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.15em', color: GREEN, marginBottom: 28,
          }}>THE SOLUTION</p>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-0.03em', color: WHITE,
            margin: '0 0 56px',
          }}>
            A broadcast engineer<br />in your system tray.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            textAlign: 'left',
          }}>
            {CAPABILITIES.map((item, i) => (
              <div key={i} style={{
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: '28px 26px',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, marginBottom: 16,
                  background: 'rgba(34,197,94,0.1)',
                  border: `1px solid rgba(34,197,94,0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: GREEN, fontSize: '0.9rem', fontWeight: 900,
                }}>✓</div>
                <div style={{
                  fontWeight: 700, fontSize: '1rem', color: WHITE, marginBottom: 10,
                }}>{item.title}</div>
                <div style={{ color: MUTED, fontSize: '0.88rem', lineHeight: 1.65 }}>{item.body}</div>
              </div>
            ))}
          </div>

          {/* Badge */}
          <div style={{
            marginTop: 56,
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 100,
            padding: '12px 24px',
          }}>
            <span style={{ color: GREEN, fontSize: '1.1rem' }}>★</span>
            <span style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.1em', color: MUTED,
              textTransform: 'uppercase',
            }}>Built on 15 years of live broadcast experience</span>
          </div>
        </div>
      </section>
    </>
  );
}
