import { env } from 'cloudflare:workers';
import { version } from '$app/env';
import type { Handle } from '@sveltejs/kit/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import { cookieName, getTextDirection } from '#lib/paraglide/runtime.js';
import { LOCALE_COOKIE, THEME_COOKIE } from '#lib/settings.ts';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { getDb } from '#lib/server/db/index.ts';
import { ensureDeviceKey } from '#lib/server/device.ts';
import { findPerson } from '#lib/server/people.ts';
import { applySettings, markSettingsChecked, settingsChecked } from '#lib/server/settings.ts';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) =>
					html
						.replace('%paraglide.lang%', locale)
						.replace('%paraglide.dir%', getTextDirection(locale))
			}
		);
	});

const handleDb: Handle = ({ event, resolve }) => {
	event.locals.db = getDb(env.DB);
	return resolve(event);
};

const handleDevice: Handle = ({ event, resolve }) => {
	event.locals.deviceKey = ensureDeviceKey(event.cookies);
	return resolve(event);
};

/**
 * A device without the person's saved language or theme gets them on the first page (GET) it
 * opens, already rendered in that language. Devices that have both cookies, or were checked
 * in the last day, don't cost an extra lookup.
 */
const handleSettings: Handle = async ({ event, resolve }) => {
	const missing = !event.cookies.get(LOCALE_COOKIE) || !event.cookies.get(THEME_COOKIE);
	if (missing && event.request.method === 'GET' && !settingsChecked(event.cookies)) {
		const person = await findPerson(event.locals.db, event.locals.deviceKey);
		markSettingsChecked(event.cookies);
		const locale = applySettings(event.cookies, person);
		if (locale) {
			// Paraglide reads the language from the request's cookies: hand it the new one
			const headers = new Headers(event.request.headers);
			const cookies = [headers.get('cookie'), `${cookieName}=${locale}`].filter(Boolean);
			headers.set('cookie', cookies.join('; '));
			return resolve({ ...event, request: new Request(event.request, { headers }) });
		}
	}
	return resolve(event);
};

/** Every dynamic response says which release served it. */
const handleVersion: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('x-app-version', version);
	return response;
};

export const handle: Handle = sequence(
	handleVersion,
	handleDb,
	handleDevice,
	handleSettings,
	handleParaglide
);
