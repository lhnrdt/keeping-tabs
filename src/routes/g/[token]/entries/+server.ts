// Older pages of the expense list, loaded while scrolling: GET ?offset=N.
import { json } from '@sveltejs/kit';
import { EXPENSES_PER_PAGE } from '#lib/group/expense-pages.ts';
import { requireGroup } from '#lib/server/context.ts';
import { entryPage } from '#lib/server/expense-entries.ts';
import { memberOf } from '#lib/server/groups.ts';
import { findPerson } from '#lib/server/people.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const group = await requireGroup(locals.db, params.token);
	const person = await findPerson(locals.db, locals.deviceKey);
	const me = await memberOf(locals.db, group.id, person?.id);
	const offset = Math.max(0, Math.floor(Number(url.searchParams.get('offset')) || 0));
	return json(await entryPage(locals.db, group.id, me, offset, EXPENSES_PER_PAGE));
};
