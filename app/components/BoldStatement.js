import { GREEN, WHITE, MUTED } from '../../lib/tokens';

export default function BoldStatement() {
  return (
    <section style={{
      padding: '128px 5%',
      textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(34,197,94,0.05) 0%, transparent 65%)',
      }} />
      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
        <p style={{
          fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 900,
          lineHeight: 0.95, letterSpacing: '-0.04em', color: WHITE, margin: '0 0 4px',
        }}>YOUR BOOTH.</p>
        <p style={{
          fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 900,
          lineHeight: 0.95, letterSpacing: '-0.04em', color: GREEN, margin: '0 0 4px',
        }}>YOUR PHONE.</p>
        <p style={{
          fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 900,
          lineHeight: 0.95, letterSpacing: '-0.04em', color: WHITE, margin: '0 0 48px',
        }}>YOUR RULES.</p>
        <p style={{ color: MUTED, fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.7 }}>
          Talk to your production like you talk to your team. &ldquo;Cut to camera 2. Start recording. What&apos;s on preview?&rdquo; Tally understands plain English.
        </p>
        <a href="/signup" style={{
          display: 'inline-block', padding: '15px 40px', fontSize: '1rem', fontWeight: 700,
          borderRadius: 8, border: 'none', background: GREEN, color: '#000',
          cursor: 'pointer', textDecoration: 'none',
        }}>
          Start Free &mdash; 30 Days &rarr;
        </a>
      </div>
    </section>
  );
}
