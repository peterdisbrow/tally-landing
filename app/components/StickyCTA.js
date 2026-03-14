'use client';
import { useEffect, useState } from 'react';
import { BG, BORDER, GREEN, WHITE } from '../../lib/tokens';

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div
        role="complementary"
        aria-label="Start free trial"
        className="sticky-cta-bar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'rgba(9,9,11,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${BORDER}`,
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
          padding: '10px 5%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span style={{
          color: WHITE, fontSize: '0.88rem', fontWeight: 600,
          display: 'none',
        }} className="sticky-cta-text">
          Church production monitoring that fixes itself.
        </span>
        <a href="/signup" style={{
          display: 'inline-block',
          padding: '8px 24px',
          fontSize: '0.85rem',
          fontWeight: 700,
          borderRadius: 6,
          border: 'none',
          background: GREEN,
          color: '#000',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          Start Free Trial &rarr;
        </a>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .sticky-cta-text {
            display: inline !important;
          }
        }
      `}</style>
    </>
  );
}
