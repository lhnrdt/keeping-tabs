// A test notification to all of this person's devices (#256): shows right away whether
// notifications get through, and what the push service said if not.
import { error, json } from '@sveltejs/kit';
import { findPerson } from '#lib/server/people.ts';
import { pushPublicKey, sendTest } from '#lib/server/push.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	if (!pushPublicKey()) error(404);
	const person = await findPerson(locals.db, locals.deviceKey);
	if (!person) return json({ results: [] });
	return json({ results: await sendTest(locals.db, person.id, getLocale()) });
};
