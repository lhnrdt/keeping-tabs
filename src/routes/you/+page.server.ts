import { fail, redirect } from '@sveltejs/kit';
import { formatAvatar, parseAvatar } from '#lib/avatars.ts';
import type { ErrorCode } from '#lib/errors.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { safePath } from '#lib/safe-redirect.ts';
import {
	ACCENT_COOKIE,
	DEFAULT_ACCENT,
	isAccent,
	isLocale,
	isTheme,
	THEME_COOKIE
} from '#lib/settings.ts';
import { ensurePerson, findPerson } from '#lib/server/people.ts';
import {
	saveSettings,
	setAccentCookie,
	setLocaleCookie,
	setThemeCookie
} from '#lib/server/settings.ts';
import { normalizeText, LIMITS } from '#lib/validation.ts';
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
		avatar: person?.avatar ?? null
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
	}
};
