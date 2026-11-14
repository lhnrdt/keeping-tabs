import { RATE_CURRENCIES } from '#lib/expense/exchange.ts';
import { DEFAULT_UNITS, DISPLAY_CURRENCY_COOKIE, isUnits, UNITS_COOKIE } from '#lib/settings.ts';
import { needsNote } from '#lib/server/note.ts';
import { personOf } from '#lib/server/people.ts';
import { ratesTo } from '#lib/server/rates.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies, url }) => {
	// Today's scenery, so pages render with its illustrations (#60), and its colours (#332)
	const { scenery: theme, colors, own = null } = locals.look;
	// How this person wants distances and amounts shown (#238)
	const chosenUnits = cookies.get(UNITS_COOKIE);
	const chosenCurrency = cookies.get(DISPLAY_CURRENCY_COOKIE) ?? '';
	const display = {
		units: isUnits(chosenUnits) ? chosenUnits : DEFAULT_UNITS,
		displayCurrency: (RATE_CURRENCIES as readonly string[]).includes(chosenCurrency)
			? chosenCurrency
			: null
	};
	const displayRates = display.displayCurrency ? await ratesTo(display.displayCurrency) : {};
	// Not on the password page: the note comes once someone is in (#112). Nor on a device
	// link: a form sent before the page is ready would lose the link's #token on the way back.
	if (url.pathname.startsWith('/welcome') || url.pathname.startsWith('/device/link')) {
		return { theme, colors, own, ...display, displayRates, showNote: false };
	}
	const person = await personOf(locals);
	return {
		theme,
		colors,
		own,
		...display,
		displayRates,
		showNote: await needsNote(locals.db, cookies, person)
	};
};
