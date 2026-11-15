import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	testMatch: '**/*.e2e.{ts,js}',
	// The local worker (wrangler) is slow while several tests run in parallel
	expect: { timeout: 10_000 },
	// On CI's shared machines a test can trip over the local database being busy ("database is
	// locked") or a slow moment: tried again, it shows as flaky in the report instead of failing
	// the run. Locally, a failure is a failure.
	retries: process.env.CI ? 2 : 0
});
