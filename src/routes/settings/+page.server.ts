import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { safePath } from '#lib/safe-redirect.ts';
import { isLocale, isTheme, THEME_COOKIE } from '#lib/settings.ts';
import { ensurePerson, findPerson } from '#lib/server/people.ts';
import { saveSettings, setLocaleCookie, setThemeCookie } from '#lib/server/settings.ts';
import { normalizeText, LIMITS } from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	const theme = cookies.get(THEME_COOKIE);
	return {
		name: person?.name ?? '',
		locale: getLocale(),
		theme: isTheme(theme) ? theme : (person?.theme ?? 'system')
	};
};

export const actions: Actions = {
	/** Name, language and appearance; a plain form post, so the new language applies at once */
	save: async ({ locals, request, cookies }) => {
		const form = await request.formData();
		const invalid = (error: ErrorCode) => fail(400, { error });

		const name = normalizeText(form.get('name'));
		if (name.length > LIMITS.memberName) return invalid('member_name_too_long');
		const locale = form.get('locale');
		const theme = form.get('theme');
		if (!isLocale(locale) || !isTheme(theme)) return invalid('settings_invalid');

		const person = await ensurePerson(locals.db, locals.deviceKey);
		await saveSettings(locals.db, person.id, { ...(name && { name }), locale, theme });
		setLocaleCookie(cookies, locale);
		setThemeCookie(cookies, theme);
		redirect(303, resolve('/settings'));
	},

	/** The footer's language switch; saved with the person if there is one */
	language: async ({ locals, request, cookies }) => {
		const form = await request.formData();
		const locale = form.get('locale');
		if (!isLocale(locale)) return fail(400, { error: 'settings_invalid' as ErrorCode });
		const person = await findPerson(locals.db, locals.deviceKey);
		if (person) await saveSettings(locals.db, person.id, { locale });
		setLocaleCookie(cookies, locale);
		redirect(303, safePath(form.get('next')));
	}
};
