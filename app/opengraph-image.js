import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Tally by ATEM School — Church Production Monitoring & Remote Control';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#09090B',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Green glow */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Tally dot + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 12px rgba(34,197,94,0.6)',
            }}
          />
          <span style={{ color: '#F8FAFC', fontSize: 28, fontWeight: 900 }}>Tally</span>
          <span style={{ color: '#475569', fontSize: 18 }}>by ATEM School</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: '#F8FAFC',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
          }}
        >
          Your Church Production.
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: '#22c55e',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 28,
          }}
        >
          In Your Pocket.
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 22,
            color: '#94A3B8',
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Monitor ATEM, OBS, Audio Consoles, and Presentations — and fix problems before anyone notices.
        </div>
      </div>
    ),
    { ...size }
  );
}
