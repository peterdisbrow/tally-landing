import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run tests from the tests/ directory
    include: ['tests/**/*.test.{js,ts}'],
    // Node environment (not jsdom) — we're testing server-side logic
    environment: 'node',
    // Isolate test files so env var changes don't leak
    isolate: true,
  },
});
