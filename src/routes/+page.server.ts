import { yourGroupsWithBalances } from '#lib/server/overview.ts';
import { findPerson } from '#lib/server/people.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	// On every device of this person (A-17)
	return { yourGroups: person ? await yourGroupsWithBalances(locals.db, person.id) : [] };
};
