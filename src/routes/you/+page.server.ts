import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { m } from '#lib/paraglide/messages.js';
import { forgetDeviceKey } from '#lib/server/device.ts';
import { eraseIdentity } from '#lib/server/erase-identity.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { safePath } from '#lib/safe-redirect.ts';
import {
	ACCENT_COOKIE,
	DEFAULT_ACCENT,
	isAccent,
	isLocale,
	isTheme,
	isUnits,
	THEME_COOKIE
} from '#lib/settings.ts';
import { listDevices } from '#lib/server/devices.ts';
import { countPasskeys } from '#lib/server/passkeys.ts';
import { findPerson, hasRecoveryKey } from '#lib/server/people.ts';
import {
	saveSettings,
	setAccentCookie,
	setDisplayCurrencyCookie,
	setLocaleCookie,
	setThemeCookie,
	setUnitsCookie
} from '#lib/server/settings.ts';
import { pushPublicKey } from '#lib/server/push.ts';
import { RATE_CURRENCIES } from '#lib/expense/exchange.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	const theme = cookies.get(THEME_COOKIE);
	const accent = cookies.get(ACCENT_COOKIE);
	return {
		personId: person?.id ?? null,
		name: person?.name ?? '',
		// What the access rows say about themselves
		...(person
			? {
					deviceCount: (await listDevices(locals.db, person.id, locals.deviceKey)).length,
					backedUp:
						(await countPasskeys(locals.db, person.id)) > 0 ||
						(await hasRecoveryKey(locals.db, person.id))
				}
			: { deviceCount: 0, backedUp: false }),
		locale: getLocale(),
		theme: isTheme(theme) ? theme : (person?.theme ?? 'system'),
		accent: isAccent(accent) ? accent : (person?.accent ?? DEFAULT_ACCENT),
		avatar: person?.avatar ?? null,
		// Notifications (#56), when this environment has its keys
		pushPublicKey: pushPublicKey()
	};
};

// Each setting saves on its own as soon as it changes (S-3). Language and theme are kept
// with the person when there is one, and in this browser's cookies either way.
export const actions: Actions = {
	accent: async ({ locals, request, cookies }) => {
		const accent = (await request.formData()).get('accent');
		if (!isAccent(accent)) {
			return fail(400, { setting: 'accent', error: 'settings_invalid' as ErrorCode });
		}
		const person = await findPerson(locals.db, locals.deviceKey);
		if (person) await saveSettings(locals.db, person.id, { accent });
		setAccentCookie(cookies, accent);
		return { setting: 'accent' };
	},

	theme: async ({ locals, request, cookies }) => {
		const theme = (await request.formData()).get('theme');
		if (!isTheme(theme)) {
			return fail(400, { setting: 'theme', error: 'settings_invalid' as ErrorCode });
		}
		const person = await findPerson(locals.db, locals.deviceKey);
		if (person) await saveSettings(locals.db, person.id, { theme });
		setThemeCookie(cookies, theme);
		return { setting: 'theme' };
	},

	/** Km and litres, or miles and gallons (#238) */
	units: async ({ locals, request, cookies }) => {
		const units = (await request.formData()).get('units');
		if (!isUnits(units)) {
			return fail(400, { setting: 'units', error: 'settings_invalid' as ErrorCode });
		}
		const person = await findPerson(locals.db, locals.deviceKey);
		if (person) await saveSettings(locals.db, person.id, { units });
		setUnitsCookie(cookies, units);
		return { setting: 'units' };
	},

	/** The currency amounts are also shown in (#238); empty for only the group's */
	displayCurrency: async ({ locals, request, cookies }) => {
		const currency = String((await request.formData()).get('displayCurrency') ?? '');
		if (currency && !(RATE_CURRENCIES as readonly string[]).includes(currency)) {
			return fail(400, { setting: 'displayCurrency', error: 'settings_invalid' as ErrorCode });
		}
		const person = await findPerson(locals.db, locals.deviceKey);
		if (person) await saveSettings(locals.db, person.id, { displayCurrency: currency || null });
		setDisplayCurrencyCookie(cookies, currency);
		return { setting: 'displayCurrency' };
	},

	/** Also the footer's language switch: the page is served again in the new language */
	language: async ({ locals, request, cookies }) => {
		const form = await request.formData();
		const locale = form.get('locale');
		if (!isLocale(locale)) {
			return fail(400, { setting: 'language', error: 'settings_invalid' as ErrorCode });
		}
		const person = await findPerson(locals.db, locals.deviceKey);
		if (person) await saveSettings(locals.db, person.id, { locale });
		setLocaleCookie(cookies, locale);
		redirect(303, safePath(form.get('next')));
	},

	/** Deletes the identity behind this device, its passkeys and links (GDPR, #74) */
	deleteIdentity: async ({ locals, request, cookies }) => {
		const person = await findPerson(locals.db, locals.deviceKey);
		if (person) {
			const form = await request.formData();
			await eraseIdentity(
				locals.db,
				person.id,
				form.get('anonymize') === 'on' ? m.former_member() : null
			);
		}
		forgetDeviceKey(cookies);
		redirect(303, resolve('/'));
	}
};
