import { fail } from '@sveltejs/kit';
import { deleteGroupNow, listDeletedGroupsOf, restoreGroup } from '#lib/server/group-deletion.ts';
import { yourGroupsWithBalances } from '#lib/server/overview.ts';
import { findPerson, personOf } from '#lib/server/people.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const person = await personOf(locals);
	// On every device of this person (A-17)
	return {
		me: person ? { id: person.id, name: person.name, avatar: person.avatar } : null,
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
	},

	/** Gone for good, for everyone, without waiting for the daily cleanup (#118) */
	deleteGroupNow: async ({ locals, request }) => {
		const person = await findPerson(locals.db, locals.deviceKey);
		const groupId = String((await request.formData()).get('groupId') ?? '');
		if (!person || !(await deleteGroupNow(locals.db, person.id, groupId))) {
			return fail(400, { error: 'group_not_restorable' as const });
		}
	}
};
