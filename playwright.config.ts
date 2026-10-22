import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	testMatch: '**/*.e2e.{ts,js}',
	// The local worker (wrangler) is slow while several tests run in parallel
	expect: { timeout: 10_000 }
});
