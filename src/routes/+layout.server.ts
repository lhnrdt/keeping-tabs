import { RATE_CURRENCIES } from '#lib/expense/exchange.ts';
import {
	ACCENT_COOKIE,
	DEFAULT_ACCENT,
	DEFAULT_UNITS,
	DISPLAY_CURRENCY_COOKIE,
	isAccent,
	isUnits,
	UNITS_COOKIE
} from '#lib/settings.ts';
import { needsNote } from '#lib/server/note.ts';
import { personOf } from '#lib/server/people.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies, url }) => {
	// The nature theme, so pages render with its illustrations (#60)
	const accent = cookies.get(ACCENT_COOKIE);
	const theme = isAccent(accent) ? accent : DEFAULT_ACCENT;
	// How this person wants distances and amounts shown (#238)
	const chosenUnits = cookies.get(UNITS_COOKIE);
	const chosenCurrency = cookies.get(DISPLAY_CURRENCY_COOKIE) ?? '';
	const display = {
		units: isUnits(chosenUnits) ? chosenUnits : DEFAULT_UNITS,
		displayCurrency: (RATE_CURRENCIES as readonly string[]).includes(chosenCurrency)
			? chosenCurrency
			: null
	};
	// Not on the password page: the note comes once someone is in (#112). Nor on a device
	// link: a form sent before the page is ready would lose the link's #token on the way back.
	if (url.pathname.startsWith('/welcome') || url.pathname.startsWith('/device/link')) {
		return { theme, ...display, showNote: false };
	}
	const person = await personOf(locals);
	return { theme, ...display, showNote: await needsNote(locals.db, cookies, person) };
};
