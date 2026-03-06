/**
 * Tests for design tokens from lib/tokens.js
 *
 * Validates that all exported tokens are valid hex colors and covers
 * naming/completeness expectations for the design system.
 */

import { describe, it, expect } from 'vitest';
import {
  BG, CARD_BG, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DIM, DANGER,
} from '../lib/tokens.js';

const ALL_TOKENS = { BG, CARD_BG, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DIM, DANGER };
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// ── Format validation ────────────────────────────────────────────────────────

describe('token format', () => {
  it('every token is a non-empty string', () => {
    for (const [name, val] of Object.entries(ALL_TOKENS)) {
      expect(typeof val, `${name} should be a string`).toBe('string');
      expect(val.length, `${name} should be non-empty`).toBeGreaterThan(0);
    }
  });

  it('every token is a valid hex color (#RGB or #RRGGBB)', () => {
    for (const [name, val] of Object.entries(ALL_TOKENS)) {
      expect(val, `${name} = "${val}" is not valid hex`).toMatch(HEX_RE);
    }
  });

  it('every token starts with #', () => {
    for (const [name, val] of Object.entries(ALL_TOKENS)) {
      expect(val[0], `${name} should start with #`).toBe('#');
    }
  });
});

// ── Completeness ──────────────────────────────────────────────────────────────

describe('token completeness', () => {
  it('exports exactly 9 tokens', () => {
    expect(Object.keys(ALL_TOKENS).length).toBe(9);
  });

  it('includes a background token (BG)', () => {
    expect(BG).toBeDefined();
  });

  it('includes a card background token (CARD_BG)', () => {
    expect(CARD_BG).toBeDefined();
  });

  it('includes a border token (BORDER)', () => {
    expect(BORDER).toBeDefined();
  });

  it('includes primary accent (GREEN) and light variant (GREEN_LT)', () => {
    expect(GREEN).toBeDefined();
    expect(GREEN_LT).toBeDefined();
  });

  it('includes text tokens (WHITE, MUTED, DIM)', () => {
    expect(WHITE).toBeDefined();
    expect(MUTED).toBeDefined();
    expect(DIM).toBeDefined();
  });

  it('includes an error / danger token', () => {
    expect(DANGER).toBeDefined();
  });
});

// ── Semantic expectations ─────────────────────────────────────────────────────

describe('semantic expectations', () => {
  // Helper: parse hex to RGB
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3
      ? h.split('').map(c => c + c).join('')
      : h;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    };
  }

  function luminance({ r, g, b }) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  it('BG is a dark color (low luminance)', () => {
    const lum = luminance(hexToRgb(BG));
    expect(lum).toBeLessThan(30);
  });

  it('WHITE is a light color (high luminance)', () => {
    const lum = luminance(hexToRgb(WHITE));
    expect(lum).toBeGreaterThan(200);
  });

  it('GREEN has dominant green channel', () => {
    const { r, g, b } = hexToRgb(GREEN);
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
  });

  it('GREEN_LT is lighter than GREEN', () => {
    const lumGreen = luminance(hexToRgb(GREEN));
    const lumLt = luminance(hexToRgb(GREEN_LT));
    expect(lumLt).toBeGreaterThan(lumGreen);
  });

  it('DANGER has dominant red channel', () => {
    const { r, g, b } = hexToRgb(DANGER);
    expect(r).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(b);
  });

  it('MUTED is lighter than DIM', () => {
    const lumMuted = luminance(hexToRgb(MUTED));
    const lumDim = luminance(hexToRgb(DIM));
    expect(lumMuted).toBeGreaterThan(lumDim);
  });

  it('CARD_BG is slightly lighter than BG', () => {
    const lumBg = luminance(hexToRgb(BG));
    const lumCard = luminance(hexToRgb(CARD_BG));
    expect(lumCard).toBeGreaterThan(lumBg);
  });
});

// ── Uniqueness ────────────────────────────────────────────────────────────────

describe('token uniqueness', () => {
  it('no two tokens share the same value', () => {
    const values = Object.values(ALL_TOKENS).map(v => v.toLowerCase());
    expect(new Set(values).size).toBe(values.length);
  });
});
