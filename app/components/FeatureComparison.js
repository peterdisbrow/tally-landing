'use client';
import { useState } from 'react';
import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

const TIERS = ['Connect', 'Plus', 'Pro', 'Enterprise'];
const TIER_PRICES = ['$49', '$99', '$149', 'Custom'];

const ROWS = [
  { feature: 'Rooms', values: ['1', '3', '5', 'Unlimited'] },
  { feature: 'ATEM / OBS / vMix Monitoring', values: [true, true, true, true] },
  { feature: 'Pre-Service Auto-Check', values: [true, true, true, true] },
  { feature: 'Slack + Telegram Alerts', values: [true, true, true, true] },
  { feature: 'Telegram Remote Control', values: [true, true, true, true] },
  { feature: 'Auto-Recovery (Stream Restart)', values: [true, true, true, true] },
  { feature: 'Post-Service Timeline', values: [true, true, true, true] },
  { feature: 'Church Portal', values: [true, true, true, true] },
  { feature: 'Signal Failover', values: [false, true, true, true] },
  { feature: 'All 23 Integrations', values: ['3 core', true, true, true] },
  { feature: 'Deep ProPresenter Control', values: [false, true, true, true] },
  { feature: 'On-Call TD Rotation', values: [false, true, true, true] },
  { feature: 'Guest TD Tokens', values: [false, true, true, true] },
  { feature: 'AI Natural Language Commands', values: [false, true, true, true] },
  { feature: 'AI Setup Assistant', values: [false, true, true, true] },
  { feature: 'AI Autopilot Rules', values: [false, '5', '10', '25'] },
  { feature: 'Planning Center Sync + Write-Back', values: [false, false, true, true] },
  { feature: 'Monthly Health Reports', values: [false, false, true, true] },
  { feature: 'Dedicated Onboarding', values: [false, false, false, true] },
  { feature: 'Custom Autopilot Rules Built For You', values: [false, false, false, true] },
  { feature: 'Remote Config Changes', values: [false, false, false, true] },
  { feature: '15-Min Response SLA', values: [false, false, false, true] },
  { feature: 'Dedicated Support Engineer', values: [false, false, false, true] },
];

function CellValue({ value }) {
  if (value === true) {
    return <span style={{ color: GREEN, fontSize: '1.1rem', fontWeight: 700 }}>{'\u2713'}</span>;
  }
  if (value === false) {
    return <span style={{ color: DIM, fontSize: '1rem' }}>&mdash;</span>;
  }
  return <span style={{ color: WHITE, fontWeight: 700, fontSize: '0.85rem', fontFamily: 'ui-monospace, monospace' }}>{value}</span>;
}

const INITIAL_COUNT = 12;

export default function FeatureComparison() {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? ROWS : ROWS.slice(0, INITIAL_COUNT);

  return (
    <div style={{ maxWidth: 1100, margin: '48px auto 0' }}>
      <h3 style={{
        fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 900,
        letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 12px',
        color: WHITE,
      }}>Compare plans side-by-side</h3>
      <p style={{ color: DIM, textAlign: 'center', marginBottom: 40, fontSize: '0.88rem' }}>
        Every plan starts with a 30-day free trial. All features included.
      </p>

      {/* Desktop table */}
      <div className="comparison-table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontSize: '0.88rem',
        }}>
          <thead>
            <tr>
              <th style={{
                textAlign: 'left', padding: '16px 16px', color: MUTED,
                borderBottom: `2px solid ${BORDER}`, fontWeight: 600, minWidth: 200,
              }}>Feature</th>
              {TIERS.map((tier, i) => (
                <th key={tier} style={{
                  textAlign: 'center', padding: '16px 12px',
                  borderBottom: `2px solid ${tier === 'Pro' ? GREEN : BORDER}`,
                  color: tier === 'Pro' ? GREEN : WHITE,
                  fontWeight: 800, fontSize: '0.9rem', minWidth: 100,
                }}>
                  {tier}
                  <div style={{
                    fontWeight: 600, fontSize: '0.75rem',
                    color: tier === 'Pro' ? GREEN : DIM,
                    marginTop: 2,
                  }}>
                    {tier === 'Connect' ? (
                      <><span style={{ textDecoration: 'line-through', opacity: 0.5 }}>$79</span> {TIER_PRICES[i]}/mo</>
                    ) : tier === 'Enterprise' ? (
                      <>{TIER_PRICES[i]}</>
                    ) : (
                      <>{TIER_PRICES[i]}/mo</>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i} style={{
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              }}>
                <td style={{
                  padding: '12px 16px', color: MUTED, fontWeight: 500,
                  borderBottom: `1px solid ${BORDER}`,
                }}>{row.feature}</td>
                {row.values.map((val, j) => (
                  <td key={j} style={{
                    textAlign: 'center', padding: '12px 12px',
                    borderBottom: `1px solid ${BORDER}`,
                  }}>
                    <CellValue value={val} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ROWS.length > INITIAL_COUNT && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => setShowAll(prev => !prev)}
            style={{
              padding: '10px 28px', fontSize: '0.88rem', fontWeight: 700,
              borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent',
              color: WHITE, cursor: 'pointer', transition: 'border-color .2s',
            }}
          >
            {showAll ? 'Show fewer features' : `Show all ${ROWS.length} features`}
          </button>
        </div>
      )}

      {/* Mobile card view */}
      <style>{`
        .comparison-mobile-cards { display: none; }
        @media (max-width: 768px) {
          .comparison-table-wrap { display: none; }
          .comparison-mobile-cards { display: block; }
        }
      `}</style>
      <div className="comparison-mobile-cards">
        {TIERS.map((tier, ti) => (
          <details key={tier} style={{
            background: tier === 'Pro' ? 'rgba(34,197,94,0.06)' : BG,
            border: `1px solid ${tier === 'Pro' ? GREEN : BORDER}`,
            borderRadius: 12, marginBottom: 12, overflow: 'hidden',
          }}>
            <summary style={{
              padding: '16px 20px', cursor: 'pointer',
              fontWeight: 800, fontSize: '1rem',
              color: tier === 'Pro' ? GREEN : WHITE,
              listStyle: 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{tier} <span style={{ fontWeight: 600, fontSize: '0.85rem', color: DIM, marginLeft: 8 }}>{tier === 'Connect' ? <><span style={{ textDecoration: 'line-through', opacity: 0.5 }}>$79</span> {TIER_PRICES[ti]}/mo</> : tier === 'Enterprise' ? <>{TIER_PRICES[ti]}</> : <>{TIER_PRICES[ti]}/mo</>}</span></span>
              <span style={{ color: MUTED, fontSize: '0.8rem' }}>tap to expand</span>
            </summary>
            <div style={{ padding: '0 20px 16px' }}>
              {ROWS.map((row, ri) => (
                <div key={ri} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: `1px solid ${BORDER}`,
                }}>
                  <span style={{ color: MUTED, fontSize: '0.85rem' }}>{row.feature}</span>
                  <CellValue value={row.values[ti]} />
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
