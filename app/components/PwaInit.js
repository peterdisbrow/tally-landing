'use client';

import { useEffect, useState } from 'react';

/**
 * PwaInit — registers the service worker and shows an "Install App" banner.
 * Renders nothing on the page; side-effects only.
 */
export default function PwaInit() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('[PWA] SW registration failed:', err.message);
      });
    }

    // Capture the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if user hasn't dismissed it before
      const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] App installed');
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  }

  function handleDismiss() {
    sessionStorage.setItem('pwa-banner-dismissed', '1');
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div
      role="banner"
      aria-label="Install Tally app"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1a2e1f',
        border: '1px solid #22c55e',
        borderRadius: '12px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        zIndex: 9999,
        maxWidth: '90vw',
        width: '420px',
      }}
    >
      <div style={{ fontSize: '28px' }}>📲</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '14px', marginBottom: '2px' }}>
          Install Tally
        </div>
        <div style={{ color: '#94A3B8', fontSize: '12px', lineHeight: 1.4 }}>
          Add to your home screen for quick access during services.
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          style={{
            background: '#22c55e',
            color: '#09090B',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          style={{
            background: 'none',
            color: '#64748B',
            border: '1px solid #1a2e1f',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
