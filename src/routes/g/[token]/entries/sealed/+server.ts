// An encrypted group's entries that changed since the browser last asked (#110, #277). Still sealed:
// the browser keeps them and works out the money.
import { json } from '@sveltejs/kit';
import { requireGroup } from '#lib/server/context.ts';
import { listExpenses, sealedEntriesSince } from '#lib/server/expenses.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const group = await requireGroup(locals.db, params.token);
	const asOf = Date.now();
	// Still being encrypted: some have their money in other tables, so all of them, every time
	if (!group.keyId) {
		const rows = await sealedEntriesSince(locals.db, group.id, null);
		const whole = await listExpenses(locals.db, group.id);
		const createdAt = new Map(rows.rows.map((row) => [row.id, row.createdAt]));
		return json({
			asOf,
			whole: true,
			removed: [],
			rows: whole.map((row) => ({ ...row, createdAt: createdAt.get(row.id) ?? 0 }))
		});
	}
	const since = Number(url.searchParams.get('since'));
	const changed = await sealedEntriesSince(locals.db, group.id, since > 0 ? since : null);
	return json({ asOf, whole: false, ...changed });
};
