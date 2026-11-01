// Production entry: the SvelteKit app, plus a daily job that removes groups deleted more than
// the retention period ago (src/lib/server/purge.ts) and adds repeating expenses that are due
// (src/lib/server/recurring.ts, #45). Staging wraps this (worker/staging.ts).
// The built SvelteKit worker exists only after `vite build`, but `pnpm check` (which follows
// this file through the generated worker types) runs before building, so it's typed here
// (@ts-expect-error would fail whenever the build does exist)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- exists only after the build
import built from '../.svelte-kit/cloudflare/_worker.js';
import { getDb } from '../src/lib/server/db/index.ts';
const ENCRYPT_CRON = '*/5 * * * *';

import { encryptNextUnopened } from '../src/lib/server/encrypt-unopened.ts';
import { endHandovers } from '../src/lib/server/encryption-handover.ts';
import { purgeDeletedGroups } from '../src/lib/server/purge.ts';
import { addDueRecurring } from '../src/lib/server/recurring.ts';

const app = built as ExportedHandler<Env>;

export default {
	fetch: app.fetch,
	async scheduled(controller, env, ctx) {
		const db = getDb(env.DB);
		const now = new Date(controller.scheduledTime);
		// Every few minutes: another little piece of encrypting groups nobody opens (#110)
		if (controller.cron === ENCRYPT_CRON) {
			ctx.waitUntil(encryptNextUnopened(db, now));
			return;
		}
		ctx.waitUntil(
			Promise.all([
				purgeDeletedGroups(db, now),
				endHandovers(db, now),
				addDueRecurring(db, now.toISOString().slice(0, 10))
			])
		);
	}
} satisfies ExportedHandler<Env>;
