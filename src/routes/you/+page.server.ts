import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { formatAvatar, parseAvatar } from '#lib/avatars.ts';
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
import { ensurePerson, findPerson } from '#lib/server/people.ts';
import {
	saveSettings,
	setAccentCookie,
	setDisplayCurrencyCookie,
	setLocaleCookie,
	setThemeCookie,
	setUnitsCookie
} from '#lib/server/settings.ts';
import { normalizeText, LIMITS } from '#lib/validation.ts';
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
		locale: getLocale(),
		theme: isTheme(theme) ? theme : (person?.theme ?? 'system'),
		accent: isAccent(accent) ? accent : (person?.accent ?? DEFAULT_ACCENT),
		avatar: person?.avatar ?? null,
		paymentDetails: person?.paymentDetails ?? '',
		// Notifications (#56), when this environment has its keys
		pushPublicKey: pushPublicKey()
	};
};

// Each setting saves on its own as soon as it changes (S-3). Language and theme are kept
// with the person when there is one, and in this browser's cookies either way.
export const actions: Actions = {
	name: async ({ locals, request }) => {
		const name = normalizeText((await request.formData()).get('name'));
		if (name.length > LIMITS.memberName) {
			return fail(400, { setting: 'name', error: 'member_name_too_long' as ErrorCode });
		}
		if (!name) return { setting: 'name' };
		const person = await ensurePerson(locals.db, locals.deviceKey);
		await saveSettings(locals.db, person.id, { name });
		return { setting: 'name' };
	},

	/** How to pay you (#47), shown to people in your groups when they pay you */
	payment: async ({ locals, request }) => {
		const details = normalizeText((await request.formData()).get('paymentDetails'));
		if (details.length > LIMITS.paymentDetails) {
			return fail(400, { setting: 'payment', error: 'payment_details_too_long' as ErrorCode });
		}
		const person = await ensurePerson(locals.db, locals.deviceKey);
		await saveSettings(locals.db, person.id, { paymentDetails: details || null });
		return { setting: 'payment' };
	},

	/** Your avatar (#61): an icon or "initials", on a tint */
	avatar: async ({ locals, request }) => {
		const form = await request.formData();
		const choice = parseAvatar(`${form.get('icon')}:${form.get('tint')}`);
		if (!choice) return fail(400, { setting: 'avatar', error: 'settings_invalid' as ErrorCode });
		const person = await ensurePerson(locals.db, locals.deviceKey);
		await saveSettings(locals.db, person.id, { avatar: formatAvatar(choice) });
		return { setting: 'avatar' };
	},

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
