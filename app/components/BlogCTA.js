import { BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

export default function BlogCTA() {
  return (
    <div
      style={{
        marginTop: 40,
        background: '#09090B',
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: '32px 28px',
        textAlign: 'center',
      }}
    >
      <h3 style={{ fontSize: 20, fontWeight: 800, color: WHITE, margin: '0 0 8px' }}>
        Ready to monitor your church production?
      </h3>
      <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
        Tally watches your ATEM, OBS, and stream health — and fixes problems before anyone notices.
      </p>
      <a
        href="/signup"
        style={{
          display: 'inline-block',
          background: GREEN,
          color: '#000',
          fontWeight: 700,
          fontSize: 15,
          borderRadius: 8,
          padding: '13px 32px',
          textDecoration: 'none',
        }}
      >
        Start Free — 30 Days &rarr;
      </a>
      <p style={{ color: DIM, fontSize: 12, marginTop: 10, marginBottom: 0 }}>
        No credit card required.
      </p>
    </div>
  );
}
