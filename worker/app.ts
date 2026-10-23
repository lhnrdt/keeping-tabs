// Production entry: the SvelteKit app, plus a daily job that removes groups deleted more than
// the retention period ago (src/lib/server/purge.ts). Staging wraps this (worker/staging.ts).
import app from '../.svelte-kit/cloudflare/_worker.js';
import { getDb } from '../src/lib/server/db/index.ts';
import { purgeDeletedGroups } from '../src/lib/server/purge.ts';

export default {
	fetch: app.fetch,
	async scheduled(controller, env, ctx) {
		ctx.waitUntil(purgeDeletedGroups(getDb(env.DB), new Date(controller.scheduledTime)));
	}
} satisfies ExportedHandler<Env>;
