'use client';
import { useEffect, useState } from 'react';
import { CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section id="testimonials" style={{ padding: '96px 5%' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Section tag */}
        <p style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: GREEN,
          textAlign: 'center',
          marginBottom: 16,
        }}>WHAT CHURCHES SAY</p>

        {/* Heading */}
        <h2 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: WHITE,
          textAlign: 'center',
          marginBottom: 48,
          lineHeight: 1.15,
        }}>
          Trusted by production teams<br />across the country
        </h2>

        {/* Reviews grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {reviews.map(review => (
            <div
              key={review.id}
              className="testimonial-card"
              style={{
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: '28px 24px',
                transition: 'border-color .2s, box-shadow .2s',
              }}
            >
              {/* Star rating */}
              <div style={{
                marginBottom: 12,
                color: GREEN,
                fontSize: '1.1rem',
                letterSpacing: 2,
              }}>
                {'★'.repeat(review.rating)}
                <span style={{ color: '#334155' }}>
                  {'★'.repeat(5 - review.rating)}
                </span>
              </div>

              {/* Quote body */}
              <p style={{
                color: WHITE,
                fontSize: '0.95rem',
                lineHeight: 1.65,
                marginBottom: 20,
                fontStyle: 'italic',
              }}>
                &ldquo;{review.body}&rdquo;
              </p>

              {/* Attribution */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${GREEN}, #16a34a)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  color: '#000',
                  flexShrink: 0,
                }}>
                  {review.reviewer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: WHITE, fontSize: '0.85rem' }}>
                    {review.reviewer_name}
                  </div>
                  <div style={{ color: DIM, fontSize: '0.75rem' }}>
                    {[review.reviewer_role, review.church_name].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
