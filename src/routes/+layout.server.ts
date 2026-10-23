import { needsNote } from '#lib/server/note.ts';
import { findPerson } from '#lib/server/people.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies, url }) => {
	// Not on the password page: the note comes once someone is in (#112)
	if (url.pathname.startsWith('/welcome')) return { showNote: false };
	const person = await findPerson(locals.db, locals.deviceKey);
	return { showNote: await needsNote(locals.db, cookies, person) };
};
