import Script from 'next/script';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';

/**
 * Site analytics.
 * Vercel Web Analytics is always mounted (uses the existing Vercel project).
 * Plausible stays optional — set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to also load it.
 */
export default function Analytics() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <>
      <VercelAnalytics />
      {plausibleDomain ? (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
