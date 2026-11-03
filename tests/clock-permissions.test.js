import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextConfig = require('../next.config.js');

// Later matching rules override earlier ones for the same header key in Next.js,
// so resolve in order the way the server does for a literal path.
async function permissionsPolicyFor(path) {
  const rules = await nextConfig.headers();
  let value = null;
  for (const rule of rules) {
    const re = new RegExp('^' + rule.source.replace(/\/:path\*$/, '(?:/.*)?').replace(/\(\.\*\)/, '.*') + '$');
    if (!re.test(path)) continue;
    for (const h of rule.headers) if (h.key === 'Permissions-Policy') value = h.value;
  }
  return value;
}

describe('Permissions-Policy: microphone', () => {
  it('stays blocked everywhere except the clock tools', async () => {
    for (const p of ['/', '/blog', '/api/church/me', '/portal']) {
      expect(await permissionsPolicyFor(p)).toContain('microphone=()');
    }
  });
  it('allows same-origin microphone on the clock pages (LTC audio input)', async () => {
    for (const p of ['/clock', '/multi-clock', '/multi-clock/', '/tools/clock', '/tools/clock/index.html']) {
      const v = await permissionsPolicyFor(p);
      expect(v).toContain('microphone=(self)');
      expect(v).toContain('camera=()');
    }
  });
});
