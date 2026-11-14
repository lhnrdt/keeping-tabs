// What of the onboarding this person has seen (#331): added to as they go, or started again.
// Only for someone who is someone already; a new device keeps it to itself until then.
import { json } from '@sveltejs/kit';
import { addOnboarding, partsIn, resetOnboarding } from '#lib/server/onboarding.ts';
import { findPerson } from '#lib/server/people.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const body = (await request.json().catch(() => null)) as {
		seen?: unknown;
		again?: unknown;
	} | null;
	const person = await findPerson(locals.db, locals.deviceKey);
	if (!person) return json({ kept: false });
	if (body?.again === true) await resetOnboarding(locals.db, person.id);
	else await addOnboarding(locals.db, person, partsIn(body?.seen));
	return json({ kept: true });
};
