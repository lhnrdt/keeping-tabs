// Older pages of the expense list, loaded while scrolling: GET ?offset=N.
import { json } from '@sveltejs/kit';
import { EXPENSES_PER_PAGE } from '#lib/group/expense-pages.ts';
import { requireGroup } from '#lib/server/context.ts';
import { entryPage } from '#lib/server/expense-entries.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const group = await requireGroup(locals.db, params.token);
	const offset = Math.max(0, Math.floor(Number(url.searchParams.get('offset')) || 0));
	return json(await entryPage(locals.db, group.id, offset, EXPENSES_PER_PAGE));
};
