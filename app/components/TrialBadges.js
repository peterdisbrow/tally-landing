import { BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

const BADGES = [
  {
    icon: '\u2713',
    text: 'All features included during trial',
  },
  {
    icon: '\u2717',
    prefix: 'No credit card',
    text: 'No credit card required',
  },
  {
    icon: '\u21e9',
    text: 'Keep your data if you cancel',
  },
];

export default function TrialBadges() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
      gap: 16, margin: '40px auto 0', maxWidth: 800,
    }}>
      {BADGES.map((badge, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(34,197,94,0.05)',
          border: `1px solid rgba(34,197,94,0.15)`,
          borderRadius: 10, padding: '12px 20px',
        }}>
          <span style={{
            color: GREEN, fontSize: '1rem', fontWeight: 700,
            flexShrink: 0,
          }}>{badge.icon}</span>
          <span style={{
            color: MUTED, fontSize: '0.88rem', fontWeight: 600,
          }}>{badge.text}</span>
        </div>
      ))}
    </div>
  );
}
