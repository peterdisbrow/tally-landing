'use client';
import { useState } from 'react';
import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

const PHASES = [
  {
    id: 'plan',
    num: '01',
    label: 'Plan',
    title: 'Build your rundown',
    desc: 'Drag-and-drop cue builder with smart timing. Set hard start times, assign durations, and organize every element of your service. Import from PDF, Word, or PowerPoint with AI — or start from a saved template.',
    color: '#3b82f6',
    details: [
      'Drag-and-drop cue ordering',
      'AI document import (PDF, Word, PowerPoint)',
      'Automatic time calculations',
      'Hard start times with over/under tracking',
      'Save and reuse templates',
      'CSV and PDF export',
    ],
  },
  {
    id: 'live',
    num: '02',
    label: 'Go Live',
    title: 'Run your show',
    desc: 'One tap to enter live show mode. GO and Back buttons advance cue-by-cue with real-time elapsed/remaining timers. Pause and resume mid-service with automatic time adjustments — your countdown clocks stay accurate.',
    color: GREEN,
    details: [
      'GO / Back cue navigation',
      'Real-time elapsed and remaining timers',
      'Pause and resume with timer adjustments',
      'Live current-cue and next-cue display',
      'Share output views — no login required',
      'Collaborative editing with presence indicators',
    ],
  },
  {
    id: 'review',
    num: '03',
    label: 'Review',
    title: 'See how it went',
    desc: 'Post-show report captures actual vs. planned times for every cue. See where you ran long, where you came in short, and refine your template for next week. Export the report as PDF for your team.',
    color: '#a78bfa',
    details: [
      'Actual vs. planned time comparison',
      'Over/under tracking per cue',
      'PDF post-show report export',
      'Refine templates from real data',
    ],
  },
];

const OUTPUT_VIEWS = [
  { name: 'Confidence Monitor', desc: 'Current and next cue with countdown timer — perfect for on-stage display', icon: '🖥️' },
  { name: 'Studio Clock', desc: 'Broadcast-style clock with current cue timer overlay for the control room', icon: '⏱️' },
  { name: 'Teleprompter', desc: 'Full-screen scrolling text for speakers and worship leaders', icon: '📜' },
  { name: 'Speaker Timer', desc: 'Large countdown display that speakers can read from across the stage', icon: '⏳' },
  { name: 'Public View', desc: 'Clean service overview for lobby displays or live stream overlays', icon: '📺' },
  { name: 'Show Control', desc: 'TD-focused view with GO/Back controls and full cue list management', icon: '🎛️' },
  { name: 'Post-Show Report', desc: 'Automatic timing report comparing planned vs. actual for every cue', icon: '📊' },
];

export default function RundownShowcase() {
  const [activePhase, setActivePhase] = useState('live');

  const phase = PHASES.find(p => p.id === activePhase);

  return (
    <section id="rundown" style={{
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
        }}>RUNDOWN PLANNER</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 16px',
          color: WHITE,
        }}>
          Plan the service. Run the show. Nail the timing.
        </h2>
        <p style={{
          color: MUTED, textAlign: 'center', fontSize: '1rem',
          maxWidth: 620, margin: '0 auto 64px', lineHeight: 1.7,
        }}>
          Full rundown planning with live show control, 7 output views,
          collaborative editing, and AI-powered document import &mdash; built for
          church production teams.
        </p>

        {/* Phase selector */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex',
            background: BG, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: 4, gap: 4,
          }}>
            {PHASES.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePhase(p.id)}
                style={{
                  padding: '10px 28px', border: 'none', borderRadius: 7,
                  fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all .2s',
                  background: activePhase === p.id ? p.color : 'transparent',
                  color: activePhase === p.id ? (p.id === 'live' ? '#000' : '#fff') : MUTED,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phase detail card */}
        <div style={{
          background: BG,
          border: `1px solid ${phase.color}30`,
          borderRadius: 16,
          padding: 'clamp(28px, 5vw, 48px)',
          boxShadow: `0 0 60px ${phase.color}10, 0 16px 48px rgba(0,0,0,0.4)`,
          transition: 'border-color .3s, box-shadow .3s',
          marginBottom: 64,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 48,
            alignItems: 'start',
          }}>
            {/* Left: description */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                marginBottom: 20,
              }}>
                <span style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.85rem', fontWeight: 800,
                  color: phase.color,
                  background: `${phase.color}12`,
                  border: `1px solid ${phase.color}30`,
                  borderRadius: 6, padding: '4px 12px',
                }}>{phase.num}</span>
                <h3 style={{
                  fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', fontWeight: 900,
                  color: WHITE, margin: 0,
                }}>{phase.title}</h3>
              </div>
              <p style={{
                color: MUTED, fontSize: '0.95rem', lineHeight: 1.7, margin: 0,
              }}>{phase.desc}</p>
            </div>

            {/* Right: feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {phase.details.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px',
                  background: `${phase.color}06`,
                  border: `1px solid ${phase.color}15`,
                  borderRadius: 8,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: phase.color, flexShrink: 0,
                  }} />
                  <span style={{
                    color: WHITE, fontSize: '0.88rem', fontWeight: 600,
                  }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output Views */}
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>7 OUTPUT VIEWS</p>

        <h3 style={{
          fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 12px',
          color: WHITE,
        }}>
          One rundown. Every screen covered.
        </h3>
        <p style={{
          color: MUTED, textAlign: 'center', fontSize: '0.92rem',
          maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.65,
        }}>
          Share output views with a link &mdash; operators don&apos;t need a login.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}>
          {OUTPUT_VIEWS.map((v, i) => (
            <div key={i} className="feature-card" style={{
              background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: '22px 20px',
              transition: 'border-color .2s, box-shadow .2s',
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0, lineHeight: 1 }}>{v.icon}</span>
                <div>
                  <div style={{
                    fontWeight: 800, fontSize: '0.92rem', color: WHITE,
                    marginBottom: 5,
                  }}>{v.name}</div>
                  <div style={{
                    color: MUTED, fontSize: '0.82rem', lineHeight: 1.55,
                  }}>{v.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <a href="/signup" style={{
            display: 'inline-block', padding: '15px 40px', fontSize: '1rem', fontWeight: 700,
            borderRadius: 8, border: 'none', background: GREEN, color: '#000',
            cursor: 'pointer', textDecoration: 'none',
          }}>
            Try the Rundown Planner Free &rarr;
          </a>
          <p style={{ color: DIM, fontSize: '0.85rem', marginTop: 14 }}>
            Included in all plans. 30-day free trial.
          </p>
        </div>
      </div>
    </section>
  );
}
