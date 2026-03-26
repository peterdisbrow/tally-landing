/**
 * Shared relay URL configuration.
 * Single source of truth — used by all API routes that proxy to the relay server.
 */

const RAW_RELAY_URL = process.env.RELAY_URL
  || process.env.NEXT_PUBLIC_RELAY_URL
  || (() => {
    // In production builds, this is a hard error — signup, login, and portal all break without it
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RELAY_URL or NEXT_PUBLIC_RELAY_URL must be set in production. Set it in .env or Vercel environment variables.');
    }
    console.error('WARNING: RELAY_URL not set — relay API calls will fail');
    return '';
  })();

export const RELAY_URL = String(RAW_RELAY_URL || '')
  .trim()
  .replace(/^wss:\/\//i, 'https://')
  .replace(/^ws:\/\//i, 'http://')
  .replace(/\/+$/, '');
