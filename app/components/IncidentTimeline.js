'use client';
import { useState, useEffect, useRef } from 'react';
import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

const STEPS = [
  { time: '01', label: 'Failure Detected', desc: 'Tally spots the drop — encoder, stream, audio, or video signal', color: '#ef4444' },
  { time: '02', label: 'Verified', desc: 'Confirms it\u2019s a real outage, not a momentary blip', color: '#f59e0b' },
  { time: '03', label: 'Auto-Recovery', desc: 'Restarts the stream, re-engages the encoder, switches to backup', color: '#3b82f6' },
  { time: '04', label: 'Confirmed Live', desc: 'Stream verified healthy. Your TD gets an alert. Congregation never knows.', color: GREEN },
];

export default function IncidentTimeline() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      padding: '128px 5%',
      borderTop: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>HOW AUTO-RECOVERY WORKS</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 16px',
          color: WHITE, maxWidth: 700,
        }}>
          It breaks. Tally fixes it.
        </h2>
        <p style={{ color: DIM, textAlign: 'center', marginBottom: 64, fontSize: '0.95rem' }}>
          Automatic detection, verification, and recovery &mdash; before your congregation notices.
        </p>

        {/* Timeline */}
        <div className={`incident-timeline${isVisible ? ' timeline-visible' : ''}`} style={{ position: 'relative' }}>
          {/* connecting line */}
          <div className="timeline-line" style={{
            position: 'absolute',
            top: 28,
            left: 0,
            right: 0,
            height: 2,
            background: BORDER,
            zIndex: 0,
          }} />
          {/* animated progress line */}
          <div className="timeline-progress" style={{
            position: 'absolute',
            top: 28,
            left: 0,
            height: 2,
            background: `linear-gradient(90deg, #ef4444, #f59e0b, #3b82f6, ${GREEN})`,
            zIndex: 1,
            width: '0%',
          }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            position: 'relative',
            zIndex: 2,
          }}>
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`timeline-step timeline-step-${i}`}
                style={{
                  textAlign: 'center',
                  opacity: 0,
                }}
              >
                {/* dot */}
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: BG, border: `3px solid ${step.color}`,
                  margin: '0 auto 20px',
                  boxShadow: `0 0 12px ${step.color}40`,
                  position: 'relative',
                }}>
                  <div className={`dot-ping dot-ping-${i}`} style={{
                    position: 'absolute', inset: -6,
                    borderRadius: '50%',
                    border: `2px solid ${step.color}`,
                    opacity: 0,
                  }} />
                </div>

                {/* time badge */}
                <div style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem',
                  fontWeight: 700, letterSpacing: '0.08em', color: step.color,
                  marginBottom: 8,
                }}>{step.time}</div>

                {/* label */}
                <div style={{
                  fontWeight: 800, fontSize: '0.95rem', color: WHITE,
                  marginBottom: 6,
                }}>{step.label}</div>

                {/* desc */}
                <p style={{
                  color: MUTED, fontSize: '0.8rem', lineHeight: 1.5,
                  margin: 0, padding: '0 4px',
                }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* mobile layout styles + animation */}
        <style>{`
          @keyframes timeline-fade-in {
            0%   { opacity: 0; transform: translateY(16px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes timeline-progress-fill {
            0%   { width: 0%; }
            100% { width: 100%; }
          }
          @keyframes dot-ping-anim {
            0%   { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(2.2); opacity: 0; }
          }

          .timeline-visible .timeline-step-0 { animation: timeline-fade-in 0.5s ease-out 0.3s forwards; }
          .timeline-visible .timeline-step-1 { animation: timeline-fade-in 0.5s ease-out 0.8s forwards; }
          .timeline-visible .timeline-step-2 { animation: timeline-fade-in 0.5s ease-out 1.3s forwards; }
          .timeline-visible .timeline-step-3 { animation: timeline-fade-in 0.5s ease-out 1.8s forwards; }

          .timeline-visible .timeline-progress {
            animation: timeline-progress-fill 2.0s ease-out 0.3s forwards;
          }

          .timeline-visible .dot-ping-0 { animation: dot-ping-anim 1s ease-out 0.5s; }
          .timeline-visible .dot-ping-1 { animation: dot-ping-anim 1s ease-out 1.0s; }
          .timeline-visible .dot-ping-2 { animation: dot-ping-anim 1s ease-out 1.5s; }
          .timeline-visible .dot-ping-3 { animation: dot-ping-anim 1s ease-out 2.0s; }

          @media (max-width: 640px) {
            .incident-timeline > div:last-child {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
            .timeline-line, .timeline-progress {
              display: none !important;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .timeline-step-0, .timeline-step-1,
            .timeline-step-2, .timeline-step-3 {
              animation: none !important;
              opacity: 1 !important;
            }
            .timeline-progress {
              animation: none !important;
              width: 100% !important;
            }
            .dot-ping-0, .dot-ping-1,
            .dot-ping-2, .dot-ping-3 {
              animation: none !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
