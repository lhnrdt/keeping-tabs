import { creatorCookieName } from '#lib/group/creator-handoff.ts';
import { requireGroup } from '#lib/server/context.ts';
import { listMembers } from '#lib/server/groups.ts';
import type { LayoutServerLoad } from './$types';

/** Group and members, shared by every screen of the group; creatorId only right after creating it. */
export const load: LayoutServerLoad = async ({ locals, params, cookies }) => {
	const group = await requireGroup(locals.db, params.token);
	return {
		group,
		members: await listMembers(locals.db, group.id),
		creatorId: cookies.get(creatorCookieName(group.id)) ?? null
	};
};
