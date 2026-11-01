// Groups nobody opens get encrypted too (#110): a little at a time, on the server's schedule, since a
// run only has a few milliseconds. It's the same work a browser does; until now the server could read
// these anyway, and it holds the key for the handover either way (encryption-handover.ts). A group too
// big for this waits for someone to open it, which does the rest.
import { encryptWith } from '#lib/crypto/encrypt-group.ts';
import { keyIdOf } from '#lib/crypto/seal.ts';
import { categorize } from '#lib/expense/categorize.ts';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import type { Db } from './db';
import { groups } from './db/schema';
import { encryptStep, textOf } from './encrypt-group';
import { allowsPlainNewGroup, placeholderMember, shouldEncrypt } from './encryption-handover';
import { receiptImage } from './receipts';

/** Rows per run; sent as one piece */
const ROWS_PER_RUN = 15;

class OutOfTime extends Error {}

export async function encryptNextUnopened(db: Db, now: Date) {
	const candidates = await db
		.select({ id: groups.id, name: groups.name, keyId: groups.keyId, key: groups.transitionKey })
		.from(groups)
		.where(
			and(
				isNull(groups.keyId),
				isNull(groups.deletedAt),
				// Tests keep most groups plain: only look at the others (encryption-handover.ts)
				allowsPlainNewGroup()
					? sql`(${groups.name} like '[auto]%' or ${groups.name} like 'enc1.%')`
					: undefined
			)
		)
		.orderBy(sql`${groups.encryptTriedAt} is not null`, asc(groups.encryptTriedAt))
		.limit(20);
	const group = candidates.find((candidate) => shouldEncrypt(candidate, true));
	// For the logs: how many are left, or whether it's stuck
	console.log(JSON.stringify({ event: 'encrypt_unopened', waiting: candidates.length }));
	if (!group) return;
	await db.update(groups).set({ encryptTriedAt: now }).where(eq(groups.id, group.id));
	const actorId = await placeholderMember(db, group.id);
	if (!actorId) return;
	let pieces = 0;
	const keys = new Map<string, string>();
	const remember = async (key: string) => {
		const keyId = await keyIdOf(key);
		keys.set(keyId, key);
		return keyId;
	};
	if (group.key) await remember(group.key);
	try {
		await encryptWith(
			{
				fetchText: () => textOf(db, group.id) as never,
				send: async (step) => {
					// One piece of work a run, and then the group's first step back next time
					if (pieces++ > 1) throw new OutOfTime();
					return (await encryptStep(db, group, actorId, step as never, true)) ?? {};
				},
				fetchPhoto: async ({ id, expenseId }) =>
					(await receiptImage(db, group.id, expenseId, id)) ?? new Uint8Array(),
				keyFor: async (keyId) => keys.get(keyId),
				rememberKey: remember
			},
			null,
			categorize,
			() => {},
			ROWS_PER_RUN
		);
	} catch (failure) {
		if (!(failure instanceof OutOfTime)) {
			// Not error-log.ts: this runs in the worker's own build, without the app's
			const { name, message, stack } = failure as Error;
			console.error(JSON.stringify({ event: 'encrypt_unopened_error', name, message, stack }));
		}
	}
}
