import { peopleOverview } from '#lib/server/overview.ts';
import { findPerson } from '#lib/server/people.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	return person ? await peopleOverview(locals.db, person.id) : { people: [], spending: null };
};
