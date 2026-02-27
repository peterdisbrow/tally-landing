import Script from 'next/script';

/**
 * Plausible analytics — privacy-friendly, no cookies, GDPR-compliant.
 * Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN in your env (e.g. "tallyconnect.app").
 * If the env var is missing, nothing renders — safe for local dev.
 */
export default function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
