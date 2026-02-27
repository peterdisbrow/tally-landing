/**
 * Shared relay URL configuration.
 * Single source of truth — used by all API routes that proxy to the relay server.
 */

const RAW_RELAY_URL = process.env.RELAY_URL
  || process.env.NEXT_PUBLIC_RELAY_URL
  || (() => { console.error('WARNING: RELAY_URL not set — relay API calls will fail'); return ''; })();

export const RELAY_URL = RAW_RELAY_URL
  .replace(/^wss:\/\//i, 'https://')
  .replace(/^ws:\/\//i, 'http://')
  .replace(/\/+$/, '');
