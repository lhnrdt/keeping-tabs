// When the group last changed (#65): small enough to ask often, so open screens can follow
// other people's changes. Every change is in the activity log.
import { json } from '@sveltejs/kit';
import { lastChangeOf } from '#lib/server/activity.ts';
import { requireGroup } from '#lib/server/context.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const group = await requireGroup(locals.db, params.token);
	return json(
		{ at: await lastChangeOf(locals.db, group.id) },
		{ headers: { 'cache-control': 'no-store' } }
	);
};
