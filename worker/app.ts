// Production entry: the SvelteKit app, plus a daily job that removes groups deleted more than
// the retention period ago (src/lib/server/purge.ts). Staging wraps this (worker/staging.ts).
// The built SvelteKit worker exists only after `vite build`, but `pnpm check` (which follows
// this file through the generated worker types) runs before building, so it's typed here
// (@ts-expect-error would fail whenever the build does exist)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- exists only after the build
import built from '../.svelte-kit/cloudflare/_worker.js';
import { getDb } from '../src/lib/server/db/index.ts';
import { purgeDeletedGroups } from '../src/lib/server/purge.ts';

const app = built as ExportedHandler<Env>;

export default {
	fetch: app.fetch,
	async scheduled(controller, env, ctx) {
		ctx.waitUntil(purgeDeletedGroups(getDb(env.DB), new Date(controller.scheduledTime)));
	}
} satisfies ExportedHandler<Env>;
