/**
 * Site analytics honesty: Vercel Web Analytics is always mounted;
 * Plausible stays env-gated; CSP and privacy copy stay accurate.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function src(rel) {
  return readFileSync(resolve(process.cwd(), rel), 'utf8');
}

describe('site analytics wiring', () => {
  it('mounts official Vercel Analytics from @vercel/analytics/react', () => {
    const analytics = src('app/analytics.js');
    expect(analytics).toMatch(/from '@vercel\/analytics\/react'/);
    expect(analytics).toMatch(/<VercelAnalytics\s*\/>/);
    expect(src('app/layout.js')).toMatch(/<Analytics\s*\/>/);
  });

  it('keeps Plausible env-gated', () => {
    const analytics = src('app/analytics.js');
    expect(analytics).toMatch(/NEXT_PUBLIC_PLAUSIBLE_DOMAIN/);
    expect(analytics).toMatch(/plausible\.io\/js\/script\.js/);
    expect(analytics).toMatch(/plausibleDomain \?/);
  });

  it('allows Vercel Analytics in CSP without dropping Plausible or the relay API', () => {
    const config = src('next.config.js');
    expect(config).toMatch(/https:\/\/va\.vercel-scripts\.com/);
    expect(config).toMatch(/https:\/\/plausible\.io/);
    expect(config).toMatch(/https:\/\/api\.tallyconnect\.app/);
    expect(config).toMatch(/wss:\/\/api\.tallyconnect\.app/);
  });
});

describe('site analytics copy', () => {
  it('describes Vercel Web Analytics and does not claim Plausible is always on', () => {
    const privacy = src('app/privacy/page.js');
    expect(privacy).toMatch(/Vercel Web Analytics/);
    expect(privacy).toMatch(/optional analytics/);
    expect(privacy).toMatch(/If it is not configured/);
    expect(privacy).not.toMatch(
      /We use Plausible Analytics, a privacy-friendly service that does not use cookies/,
    );
  });

  it('keeps the cookie banner honest about cookieless pageviews', () => {
    const banner = src('app/components/CookieConsent.js');
    expect(banner).toMatch(/privacy-friendly pageviews/);
    expect(banner).toMatch(/no advertising or tracking cookies/i);
  });
});
