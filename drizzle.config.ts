import { defineConfig } from 'drizzle-kit';

// Drizzle only generates SQL into ./drizzle; wrangler applies it (see db:migrate:* scripts),
// so migration state is tracked by D1 itself and no API token is needed.
export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	verbose: true,
	strict: true
});
