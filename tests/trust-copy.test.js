/**
 * Regression: leftover marketing overclaims from the trust-copy pass.
 * Reads source files as text so client components do not need a DOM.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PRICING } from '../lib/data.js';
import { SYSTEM_PROMPT } from '../lib/chat-knowledge.js';

function src(rel) {
  return readFileSync(resolve(process.cwd(), rel), 'utf8');
}

const MARKETING_FILES = [
  'app/page.js',
  'app/signup/page.js',
  'app/es/signup/page.js',
  'app/es/page.js',
  'app/help/page.js',
  'app/download/page.js',
  'app/components/Hero.js',
  'app/components/FAQ.js',
  'app/components/Pricing.js',
  'app/components/EarlyAccessForm.js',
  'app/components/ChatWidget.js',
  'app/components/Testimonials.js',
  'app/components/AppShowcase.js',
  'app/components/BoldStatement.js',
  'app/signup/success/page.js',
  'app/api/church/onboard/route.js',
];

describe('trust copy — no leftover overclaims', () => {
  const joined = MARKETING_FILES.map(src).join('\n');

  it('does not use founding scarcity or fake annual discount language', () => {
    expect(joined).not.toMatch(/LIMITED SPOTS/i);
    expect(joined).not.toMatch(/JOIN THE FOUNDING/i);
    expect(joined).not.toMatch(/Early church pricing/i);
    expect(joined).not.toMatch(/save 25%/i);
    expect(joined).not.toMatch(/save 3 months/i);
  });

  it('does not claim no credit card when Checkout may collect one', () => {
    expect(joined).not.toMatch(/No credit card required/i);
    expect(joined).not.toMatch(/Limited spots\. No credit card/i);
  });

  it('does not quote a dollar price for Enterprise', () => {
    expect(joined).not.toMatch(/Enterprise[^\n]{0,40}\$499/i);
    expect(joined).not.toMatch(/\$499\s*\/\s*mo/i);
  });

  it('does not advertise Dante or Vimeo as integrations', () => {
    expect(src('app/page.js')).not.toMatch(/Dante audio/);
    expect(src('app/page.js')).not.toMatch(/Vimeo Live/);
  });

  it('does not point downloads at the old signed 1.0.1 DMG or wrong GitHub org', () => {
    expect(joined).not.toMatch(/Tally-signed\.dmg/);
    expect(joined).not.toMatch(/github\.com\/tallyconnect\/tally/);
    expect(joined).not.toMatch(/v1\.0\.1/);
  });

  it('does not send Event buyers to signup?plan=event', () => {
    expect(src('app/components/ChatWidget.js')).not.toMatch(/\/signup\?plan=event/);
  });

  it('does not ship named fallback testimonials', () => {
    expect(src('app/components/Testimonials.js')).not.toMatch(/FALLBACK_REVIEWS/);
    expect(src('app/es/page.js')).not.toMatch(/FALLBACK_REVIEWS/);
    expect(src('app/components/Testimonials.js')).not.toMatch(/Grace Community Church/);
  });
});

describe('trust copy — still-honest facts', () => {
  it('keeps Event at $99 one-time', () => {
    const pricing = src('app/components/Pricing.js');
    expect(pricing).toMatch(/\$99 one-time/);
    expect(pricing).toMatch(/72-hour monitoring/);
    expect(src('app/help/page.js')).toMatch(/Event tier \(\$99 one-time\)/);
  });

  it('keeps annual billing as 12× with no advertised discount', () => {
    for (const tier of PRICING.filter(t => !t.customPricing)) {
      expect(tier.annualPrice).toBe(tier.monthlyPrice * 12);
    }
    expect(src('app/components/Pricing.js')).toMatch(/BILLED YEARLY \(12×\)/);
  });

  it('keeps Enterprise as custom / contact sales', () => {
    const enterprise = PRICING.find(t => t.plan === 'managed');
    expect(enterprise.customPricing).toBe(true);
    expect(enterprise.ctaHref).toMatch(/^mailto:sales@/);
  });

  it('states that AI is assistive and Sunday core works without it', () => {
    expect(src('app/components/FAQ.js')).toMatch(/AI is assistive/);
    expect(src('app/components/FAQ.js')).toMatch(/not required to run Sunday/);
    expect(SYSTEM_PROMPT).toMatch(/Sunday core/);
    expect(SYSTEM_PROMPT).toMatch(/works without Claude/i);
  });

  it('states Stripe Checkout may ask for a payment method', () => {
    expect(src('app/signup/page.js')).toMatch(/may ask for a payment method/);
    expect(src('app/help/page.js')).toMatch(/may ask for a payment method/);
  });

  it('keeps download version honesty (unsigned Windows, Mac carry-forward)', () => {
    const download = src('app/download/page.js');
    expect(download).toMatch(/unsigned/);
    expect(download).toMatch(/macIsCarryForward/);
    expect(download).toMatch(/last signed Mac build/);
  });
});
