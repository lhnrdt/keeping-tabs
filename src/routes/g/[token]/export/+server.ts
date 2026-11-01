// The group's expenses as a CSV download (#50), in Splitwise's format.
import { toSplitwiseCsv } from '#lib/export/splitwise.ts';
import { requireGroup } from '#lib/server/context.ts';
import { downloadHeaders } from '#lib/server/download.ts';
import { listExpenses } from '#lib/server/expenses.ts';
import { listFormerMembers, listMembers } from '#lib/server/groups.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const group = await requireGroup(locals.db, params.token);
	const [members, formerMembers, expenses] = await Promise.all([
		listMembers(locals.db, group.id),
		// Their past expenses are still part of the group
		listFormerMembers(locals.db, group.id),
		listExpenses(locals.db, group.id)
	]);
	return new Response(toSplitwiseCsv(group.currency, [...members, ...formerMembers], expenses), {
		headers: downloadHeaders(group.name, 'csv', 'text/csv; charset=utf-8')
	});
};
