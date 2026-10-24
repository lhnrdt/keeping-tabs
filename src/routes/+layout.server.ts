import { ACCENT_COOKIE, DEFAULT_ACCENT, isAccent } from '#lib/settings.ts';
import { needsNote } from '#lib/server/note.ts';
import { findPerson } from '#lib/server/people.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies, url }) => {
	// The nature theme, so pages render with its illustrations (#60)
	const accent = cookies.get(ACCENT_COOKIE);
	const theme = isAccent(accent) ? accent : DEFAULT_ACCENT;
	// Not on the password page: the note comes once someone is in (#112). Nor on a device
	// link: a form sent before the page is ready would lose the link's #token on the way back.
	if (url.pathname.startsWith('/welcome') || url.pathname.startsWith('/device/link')) {
		return { theme, showNote: false };
	}
	const person = await findPerson(locals.db, locals.deviceKey);
	return { theme, showNote: await needsNote(locals.db, cookies, person) };
};
