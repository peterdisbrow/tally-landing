'use client';

import { useEffect, useState } from 'react';
import { CARD_BG, BORDER, GREEN, MUTED } from '../../lib/tokens';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('tally_cookie_consent')) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem('tally_cookie_consent', 'accepted');
    setVisible(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 480,
        margin: '0 auto',
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        zIndex: 9999,
        fontSize: 13,
        color: MUTED,
        lineHeight: 1.5,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ flex: 1 }}>
        We use essential cookies for payments (Stripe) and session management. No tracking cookies.{' '}
        <a href="/privacy" style={{ color: GREEN, textDecoration: 'underline' }}>Privacy Policy</a>
      </div>
      <button
        onClick={accept}
        style={{
          background: GREEN,
          color: '#000',
          border: 'none',
          borderRadius: 8,
          padding: '8px 18px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Got it
      </button>
    </div>
  );
}
