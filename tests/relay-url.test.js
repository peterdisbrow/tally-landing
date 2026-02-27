/**
 * Tests for the relay URL configuration from lib/relay.js
 *
 * The module reads RELAY_URL / NEXT_PUBLIC_RELAY_URL from process.env
 * and applies protocol conversion (wss->https, ws->http) plus trailing
 * slash removal.
 *
 * Since the module runs its transform at import time, we must set the
 * env var BEFORE each dynamic import and reset modules between tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('RELAY_URL configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    // Clear all relay-related env vars before each test
    delete process.env.RELAY_URL;
    delete process.env.NEXT_PUBLIC_RELAY_URL;
  });

  // ── WSS to HTTPS conversion ──────────────────────────────────────────────

  describe('WSS to HTTPS conversion', () => {
    it('converts wss:// to https://', async () => {
      process.env.RELAY_URL = 'wss://relay.example.com';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('https://relay.example.com');
    });

    it('converts WSS:// (uppercase) to https://', async () => {
      process.env.RELAY_URL = 'WSS://relay.example.com';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('https://relay.example.com');
    });

    it('preserves path after wss:// conversion', async () => {
      process.env.RELAY_URL = 'wss://relay.example.com/api/v1';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('https://relay.example.com/api/v1');
    });
  });

  // ── WS to HTTP conversion ───────────────────────────────────────────────

  describe('WS to HTTP conversion', () => {
    it('converts ws:// to http://', async () => {
      process.env.RELAY_URL = 'ws://localhost:3001';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('http://localhost:3001');
    });

    it('converts WS:// (uppercase) to http://', async () => {
      process.env.RELAY_URL = 'WS://localhost:3001';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('http://localhost:3001');
    });
  });

  // ── Trailing slash removal ───────────────────────────────────────────────

  describe('trailing slash removal', () => {
    it('removes a single trailing slash', async () => {
      process.env.RELAY_URL = 'https://relay.example.com/';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('https://relay.example.com');
    });

    it('removes multiple trailing slashes', async () => {
      process.env.RELAY_URL = 'https://relay.example.com///';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('https://relay.example.com');
    });

    it('handles wss:// with trailing slash', async () => {
      process.env.RELAY_URL = 'wss://relay.example.com/';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('https://relay.example.com');
    });
  });

  // ── Pass-through for normal HTTPS URLs ───────────────────────────────────

  describe('HTTPS pass-through', () => {
    it('leaves https:// URLs unchanged (no trailing slash)', async () => {
      process.env.RELAY_URL = 'https://relay.example.com';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('https://relay.example.com');
    });

    it('leaves http:// URLs unchanged (no trailing slash)', async () => {
      process.env.RELAY_URL = 'http://localhost:3001';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('http://localhost:3001');
    });
  });

  // ── Empty / missing URL ──────────────────────────────────────────────────

  describe('empty or missing URL', () => {
    it('produces an empty string when RELAY_URL is not set', async () => {
      // Both env vars are deleted in beforeEach
      // Suppress the console.error from the IIFE warning
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('');
      consoleSpy.mockRestore();
    });

    it('does NOT fall back to a hardcoded Railway URL', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).not.toContain('railway');
      expect(RELAY_URL).not.toContain('Railway');
      expect(RELAY_URL).toBe('');
      consoleSpy.mockRestore();
    });

    it('logs a warning when RELAY_URL is missing', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await import('../lib/relay.js');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('RELAY_URL not set'),
      );
      consoleSpy.mockRestore();
    });
  });

  // ── NEXT_PUBLIC_RELAY_URL fallback ───────────────────────────────────────

  describe('NEXT_PUBLIC_RELAY_URL fallback', () => {
    it('uses NEXT_PUBLIC_RELAY_URL when RELAY_URL is not set', async () => {
      process.env.NEXT_PUBLIC_RELAY_URL = 'wss://public-relay.example.com';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('https://public-relay.example.com');
    });

    it('prefers RELAY_URL over NEXT_PUBLIC_RELAY_URL', async () => {
      process.env.RELAY_URL = 'https://primary.example.com';
      process.env.NEXT_PUBLIC_RELAY_URL = 'https://fallback.example.com';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('https://primary.example.com');
    });
  });

  // ── Combined transformations ─────────────────────────────────────────────

  describe('combined transformations', () => {
    it('converts wss and removes trailing slash in one pass', async () => {
      process.env.RELAY_URL = 'wss://relay.example.com/';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('https://relay.example.com');
    });

    it('converts ws with port and trailing slash', async () => {
      process.env.RELAY_URL = 'ws://192.168.1.100:8080/';
      const { RELAY_URL } = await import('../lib/relay.js');
      expect(RELAY_URL).toBe('http://192.168.1.100:8080');
    });
  });
});
