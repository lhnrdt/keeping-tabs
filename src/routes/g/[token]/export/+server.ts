// The group's expenses as a CSV download (#50), in Splitwise's format.
import { toSplitwiseCsv } from '#lib/export/splitwise.ts';
import { requireGroup } from '#lib/server/context.ts';
import { listExpenses } from '#lib/server/expenses.ts';
import { listFormerMembers, listMembers } from '#lib/server/groups.ts';
import type { RequestHandler } from './$types';

/** "Trip to Oslo" → Trip to Oslo.csv; the name may have any characters, so it's encoded */
const attachment = (name: string) =>
	`attachment; filename="export.csv"; filename*=UTF-8''${encodeURIComponent(`${name}.csv`)}`;

export const GET: RequestHandler = async ({ locals, params }) => {
	const group = await requireGroup(locals.db, params.token);
	const [members, formerMembers, expenses] = await Promise.all([
		listMembers(locals.db, group.id),
		// Their past expenses are still part of the group
		listFormerMembers(locals.db, group.id),
		listExpenses(locals.db, group.id)
	]);
	return new Response(toSplitwiseCsv(group.currency, [...members, ...formerMembers], expenses), {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': attachment(group.name),
			'cache-control': 'private, no-store'
		}
	});
};
