'use client';
import { useState, useMemo } from 'react';
import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

const COST_OPTIONS = [
  { label: '$100', value: 100 },
  { label: '$500', value: 500 },
  { label: '$1,000', value: 1000 },
  { label: '$5,000', value: 5000 },
];

/* Map services/week to a recommended plan & annual price */
function recommendedPlan(services) {
  if (services <= 2) return { name: 'Connect', annual: 490, monthly: 49 };
  if (services <= 5) return { name: 'Plus', annual: 990, monthly: 99 };
  if (services <= 8) return { name: 'Pro', annual: 1490, monthly: 149 };
  return { name: 'Enterprise', annual: 4990, monthly: 499 };
}

export default function ROICalculator() {
  const [services, setServices] = useState(2);
  const [viewers, setViewers] = useState(200);
  const [failCost, setFailCost] = useState(500);

  const calc = useMemo(() => {
    // Industry average: ~0.5-1.0 incidents per service per year baseline
    // More services = more chances; scale sub-linearly
    const baseIncidents = Math.round(6 + (services - 1) * 0.8);
    const incidents = Math.min(baseIncidents, 24);

    // Larger audiences amplify impact
    const audienceFactor = 1 + Math.log10(Math.max(viewers, 10)) / 4;
    const effectiveSavings = Math.round(incidents * failCost * audienceFactor);

    const plan = recommendedPlan(services);
    const tallyCost = plan.annual;
    const net = effectiveSavings - tallyCost;
    const roi = tallyCost > 0 ? Math.round((net / tallyCost) * 100) : 0;

    return { incidents, effectiveSavings, tallyCost, net, roi, plan };
  }, [services, viewers, failCost]);

  const sliderTrack = (value, min, max) => {
    const pct = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, ${GREEN} 0%, ${GREEN} ${pct}%, ${BORDER} ${pct}%, ${BORDER} 100%)`;
  };

  return (
    <section id="roi" style={{
      padding: '128px 5%',
      borderTop: `1px solid ${BORDER}`,
    }}>
      <style>{`
        .roi-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
        }
        .roi-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${GREEN};
          border: 2px solid ${WHITE};
          cursor: pointer;
          box-shadow: 0 0 8px rgba(34,197,94,0.4);
        }
        .roi-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${GREEN};
          border: 2px solid ${WHITE};
          cursor: pointer;
          box-shadow: 0 0 8px rgba(34,197,94,0.4);
        }
        .roi-select {
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394A3B8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>ROI CALCULATOR</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 16px',
          color: WHITE,
        }}>See what streaming failures actually cost you.</h2>

        <p style={{
          color: MUTED, textAlign: 'center', fontSize: '1rem',
          maxWidth: 560, margin: '0 auto 64px', lineHeight: 1.7,
        }}>
          Adjust the sliders to match your church. Tally pays for itself after a single prevented incident.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 24,
        }}>
          {/* Inputs */}
          <div style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: '36px 28px',
          }}>
            {/* Services per week */}
            <div style={{ marginBottom: 36 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', marginBottom: 12,
              }}>
                <label style={{ color: WHITE, fontWeight: 700, fontSize: '0.95rem' }}>
                  Services per week
                </label>
                <span style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: '1.1rem',
                  fontWeight: 900, color: GREEN,
                }}>{services}</span>
              </div>
              <input
                className="roi-slider"
                type="range" min={1} max={10} step={1}
                value={services}
                onChange={e => setServices(Number(e.target.value))}
                style={{ background: sliderTrack(services, 1, 10) }}
                aria-label="Services per week"
              />
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                color: DIM, fontSize: '0.72rem', marginTop: 6,
              }}>
                <span>1</span><span>10</span>
              </div>
            </div>

            {/* Average online viewers */}
            <div style={{ marginBottom: 36 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', marginBottom: 12,
              }}>
                <label style={{ color: WHITE, fontWeight: 700, fontSize: '0.95rem' }}>
                  Average online viewers
                </label>
                <span style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: '1.1rem',
                  fontWeight: 900, color: GREEN,
                }}>{viewers.toLocaleString()}</span>
              </div>
              <input
                className="roi-slider"
                type="range" min={10} max={5000} step={10}
                value={viewers}
                onChange={e => setViewers(Number(e.target.value))}
                style={{ background: sliderTrack(viewers, 10, 5000) }}
                aria-label="Average online viewers"
              />
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                color: DIM, fontSize: '0.72rem', marginTop: 6,
              }}>
                <span>10</span><span>5,000</span>
              </div>
            </div>

            {/* Cost of a failed stream */}
            <div>
              <label style={{
                color: WHITE, fontWeight: 700, fontSize: '0.95rem',
                display: 'block', marginBottom: 12,
              }}>
                Estimated cost of a failed stream
              </label>
              <select
                className="roi-select"
                value={failCost}
                onChange={e => setFailCost(Number(e.target.value))}
                aria-label="Estimated cost of a failed stream"
                style={{
                  width: '100%', padding: '13px 16px', fontSize: '0.95rem',
                  fontWeight: 700, borderRadius: 8,
                  border: `1px solid ${BORDER}`, background: BG, color: WHITE,
                  cursor: 'pointer',
                }}
              >
                {COST_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p style={{ color: DIM, fontSize: '0.78rem', marginTop: 8, lineHeight: 1.5 }}>
                Includes lost donations, volunteer time, reputation impact, and re-engagement costs.
              </p>
            </div>
          </div>

          {/* Results */}
          <div style={{
            background: 'rgba(34,197,94,0.04)', border: `2px solid ${GREEN}`,
            borderRadius: 16, padding: '36px 28px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: '0 0 40px rgba(34,197,94,0.08)',
          }}>
            <div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ color: DIM, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>
                  INCIDENTS PREVENTED / YEAR
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: WHITE, letterSpacing: '-0.03em' }}>
                  {calc.incidents}
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={{ color: DIM, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>
                  ESTIMATED SAVINGS
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: GREEN, letterSpacing: '-0.03em' }}>
                  ${calc.effectiveSavings.toLocaleString()}<span style={{ fontSize: '1rem', color: DIM }}>/yr</span>
                </div>
              </div>

              <div style={{
                display: 'flex', gap: 32, marginBottom: 28,
                borderTop: `1px solid rgba(34,197,94,0.2)`, paddingTop: 20,
              }}>
                <div>
                  <div style={{ color: DIM, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>
                    TALLY COST ({calc.plan.name})
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: WHITE }}>
                    ${calc.tallyCost.toLocaleString()}<span style={{ fontSize: '0.8rem', color: DIM }}>/yr</span>
                  </div>
                </div>
                <div>
                  <div style={{ color: DIM, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>
                    NET ROI
                  </div>
                  <div style={{
                    fontSize: '1.3rem', fontWeight: 800,
                    color: calc.roi > 0 ? GREEN : '#ef4444',
                  }}>
                    {calc.roi > 0 ? '+' : ''}{calc.roi}%
                  </div>
                </div>
              </div>
            </div>

            <a href="/signup" style={{
              display: 'block', textAlign: 'center',
              padding: '16px 24px', fontSize: '1.05rem', fontWeight: 800,
              borderRadius: 10, textDecoration: 'none',
              background: GREEN, color: '#000',
              boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
              transition: 'transform .15s, box-shadow .15s',
            }}>
              Start saving &rarr; Free trial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
