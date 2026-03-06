/**
 * Tests for landing page data integrity from lib/data.js
 *
 * Validates that marketing data structures (features, pricing, integrations,
 * nav links, hardware) are complete, consistent, and safe to render.
 */

import { describe, it, expect } from 'vitest';
import {
  FEATURES,
  INTEGRATIONS,
  STEPS,
  PRICING,
  HARDWARE,
  SCROLL_DEVICES,
  NAV_LINKS,
} from '../lib/data.js';

// ── FEATURES ─────────────────────────────────────────────────────────────────

describe('FEATURES', () => {
  it('contains at least 10 features', () => {
    expect(FEATURES.length).toBeGreaterThanOrEqual(10);
  });

  it('every feature has tag, name, and desc', () => {
    for (const f of FEATURES) {
      expect(typeof f.tag).toBe('string');
      expect(f.tag.length).toBeGreaterThan(0);
      expect(typeof f.name).toBe('string');
      expect(f.name.length).toBeGreaterThan(0);
      expect(typeof f.desc).toBe('string');
      expect(f.desc.length).toBeGreaterThan(0);
    }
  });

  it('all feature tags are uppercase', () => {
    for (const f of FEATURES) {
      expect(f.tag).toBe(f.tag.toUpperCase());
    }
  });

  it('all feature names are unique', () => {
    const names = FEATURES.map(f => f.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

// ── INTEGRATIONS ─────────────────────────────────────────────────────────────

describe('INTEGRATIONS', () => {
  it('contains at least 20 integrations', () => {
    expect(INTEGRATIONS.length).toBeGreaterThanOrEqual(20);
  });

  it('every integration has name and tag', () => {
    for (const i of INTEGRATIONS) {
      expect(typeof i.name).toBe('string');
      expect(i.name.length).toBeGreaterThan(0);
      expect(typeof i.tag).toBe('string');
      expect(i.tag.length).toBeGreaterThan(0);
    }
  });

  it('all integration names are unique', () => {
    const names = INTEGRATIONS.map(i => i.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('covers expected categories', () => {
    const tags = new Set(INTEGRATIONS.map(i => i.tag));
    expect(tags.has('SWITCHER')).toBe(true);
    expect(tags.has('STREAMING')).toBe(true);
    expect(tags.has('AUDIO')).toBe(true);
    expect(tags.has('ALERTS')).toBe(true);
  });
});

// ── STEPS ────────────────────────────────────────────────────────────────────

describe('STEPS', () => {
  it('has exactly 3 steps', () => {
    expect(STEPS.length).toBe(3);
  });

  it('steps are numbered 01, 02, 03', () => {
    expect(STEPS.map(s => s.num)).toEqual(['01', '02', '03']);
  });

  it('every step has title and desc', () => {
    for (const s of STEPS) {
      expect(typeof s.title).toBe('string');
      expect(typeof s.desc).toBe('string');
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.desc.length).toBeGreaterThan(0);
    }
  });
});

// ── PRICING ──────────────────────────────────────────────────────────────────

describe('PRICING', () => {
  it('has exactly 4 tiers', () => {
    expect(PRICING.length).toBe(4);
  });

  it('tiers are in ascending price order', () => {
    for (let i = 1; i < PRICING.length; i++) {
      expect(PRICING[i].monthlyPrice).toBeGreaterThan(PRICING[i - 1].monthlyPrice);
    }
  });

  it('annual price is always less than 12x monthly', () => {
    for (const tier of PRICING) {
      expect(tier.annualPrice).toBeLessThan(tier.monthlyPrice * 12);
    }
  });

  it('every tier has required fields', () => {
    for (const tier of PRICING) {
      expect(typeof tier.name).toBe('string');
      expect(typeof tier.plan).toBe('string');
      expect(typeof tier.monthlyPrice).toBe('number');
      expect(typeof tier.annualPrice).toBe('number');
      expect(typeof tier.desc).toBe('string');
      expect(typeof tier.featured).toBe('boolean');
      expect(typeof tier.cta).toBe('string');
      expect(typeof tier.ctaHref).toBe('string');
      expect(Array.isArray(tier.features)).toBe(true);
      expect(tier.features.length).toBeGreaterThan(0);
    }
  });

  it('plan names match allowed tier values', () => {
    const allowed = new Set(['connect', 'plus', 'pro', 'managed']);
    for (const tier of PRICING) {
      expect(allowed.has(tier.plan)).toBe(true);
    }
  });

  it('exactly one tier is featured', () => {
    const featured = PRICING.filter(t => t.featured);
    expect(featured.length).toBe(1);
  });

  it('CTA hrefs are valid paths or mailto links', () => {
    for (const tier of PRICING) {
      expect(
        tier.ctaHref.startsWith('/') || tier.ctaHref.startsWith('mailto:')
      ).toBe(true);
    }
  });

  it('every tier has at least 5 feature lines', () => {
    for (const tier of PRICING) {
      expect(tier.features.length).toBeGreaterThanOrEqual(5);
    }
  });
});

// ── HARDWARE ─────────────────────────────────────────────────────────────────

describe('HARDWARE', () => {
  it('has at least 1 hardware product', () => {
    expect(HARDWARE.length).toBeGreaterThanOrEqual(1);
  });

  it('every product has required fields', () => {
    for (const h of HARDWARE) {
      expect(typeof h.name).toBe('string');
      expect(typeof h.price).toBe('string');
      expect(h.price).toMatch(/^\$/); // starts with $
      expect(typeof h.desc).toBe('string');
      expect(Array.isArray(h.specs)).toBe(true);
      expect(h.specs.length).toBeGreaterThan(0);
    }
  });
});

// ── NAV_LINKS ────────────────────────────────────────────────────────────────

describe('NAV_LINKS', () => {
  it('has at least 5 navigation links', () => {
    expect(NAV_LINKS.length).toBeGreaterThanOrEqual(5);
  });

  it('every link has href and label', () => {
    for (const link of NAV_LINKS) {
      expect(typeof link.href).toBe('string');
      expect(typeof link.label).toBe('string');
      expect(link.href.length).toBeGreaterThan(0);
      expect(link.label.length).toBeGreaterThan(0);
    }
  });

  it('contains a Blog link pointing to /blog', () => {
    const blog = NAV_LINKS.find(l => l.label === 'Blog');
    expect(blog).toBeDefined();
    expect(blog.href).toBe('/blog');
  });

  it('contains a Sign In link', () => {
    const signIn = NAV_LINKS.find(l => l.label === 'Sign In');
    expect(signIn).toBeDefined();
  });

  it('Free Tools has children with at least 2 items', () => {
    const tools = NAV_LINKS.find(l => l.label === 'Free Tools');
    expect(tools).toBeDefined();
    expect(Array.isArray(tools.children)).toBe(true);
    expect(tools.children.length).toBeGreaterThanOrEqual(2);
  });

  it('Free Tools children each have href and label', () => {
    const tools = NAV_LINKS.find(l => l.label === 'Free Tools');
    for (const child of tools.children) {
      expect(typeof child.href).toBe('string');
      expect(typeof child.label).toBe('string');
    }
  });

  it('hrefs are either hash anchors or absolute paths', () => {
    for (const link of NAV_LINKS) {
      expect(
        link.href.startsWith('#') || link.href.startsWith('/')
      ).toBe(true);
    }
  });
});

// ── SCROLL_DEVICES ───────────────────────────────────────────────────────────

describe('SCROLL_DEVICES', () => {
  it('has at least 10 devices for the marquee', () => {
    expect(SCROLL_DEVICES.length).toBeGreaterThanOrEqual(10);
  });

  it('every device is a non-empty string', () => {
    for (const d of SCROLL_DEVICES) {
      expect(typeof d).toBe('string');
      expect(d.length).toBeGreaterThan(0);
    }
  });
});
