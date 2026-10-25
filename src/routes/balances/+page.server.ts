import { peopleOverview } from '#lib/server/overview.ts';
import { personOf } from '#lib/server/people.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const person = await personOf(locals);
	return person ? await peopleOverview(locals.db, person.id) : { people: [], spending: null };
};
