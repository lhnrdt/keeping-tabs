import { fail } from '@sveltejs/kit';
import { listDeletedGroupsOf, restoreGroup } from '#lib/server/group-deletion.ts';
import { yourGroupsWithBalances } from '#lib/server/overview.ts';
import { findPerson } from '#lib/server/people.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	// On every device of this person (A-17)
	return {
		yourGroups: person ? await yourGroupsWithBalances(locals.db, person.id) : [],
		recentlyDeleted: person ? await listDeletedGroupsOf(locals.db, person.id) : []
	};
};

export const actions: Actions = {
	/** Brings a deleted group back, for its members (G-3) */
	restoreGroup: async ({ locals, request }) => {
		const person = await findPerson(locals.db, locals.deviceKey);
		const groupId = String((await request.formData()).get('groupId') ?? '');
		if (!person || !(await restoreGroup(locals.db, person.id, groupId))) {
			return fail(400, { error: 'group_not_restorable' as const });
		}
	}
};
