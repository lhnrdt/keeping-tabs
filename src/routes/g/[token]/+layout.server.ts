import { requireGroup } from '#lib/server/context.ts';
import { listMembers } from '#lib/server/groups.ts';
import { findPerson } from '#lib/server/people.ts';
import type { LayoutServerLoad } from './$types';

/**
 * Group and members, shared by every screen of the group. Each member says whether it's
 * claimed and whether it's this device's own (A-4); avatarId keeps a person's avatar color
 * the same in every group (A-13).
 */
export const load: LayoutServerLoad = async ({ locals, params }) => {
	const group = await requireGroup(locals.db, params.token);
	const [members, person] = await Promise.all([
		listMembers(locals.db, group.id),
		findPerson(locals.db, locals.deviceKey)
	]);
	return {
		group,
		members: members.map(({ id, name, personId }) => ({
			id,
			name,
			avatarId: personId ?? id,
			claimed: personId !== null,
			mine: personId !== null && personId === person?.id
		})),
		profileName: person?.name ?? null
	};
};
