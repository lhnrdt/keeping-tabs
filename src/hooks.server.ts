import { env } from 'cloudflare:workers';
import { version } from '$app/env';
import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { resolve as resolveRoute } from '$app/paths';
import { cookieName, getTextDirection } from '#lib/paraglide/runtime.js';
import { LOCALE_COOKIE, THEME_COOKIE } from '#lib/settings.ts';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { getDb } from '#lib/server/db/index.ts';
import { grantAccess, hasAccess, isOpenPath } from '#lib/server/access.ts';
import { ensureDeviceKey } from '#lib/server/device.ts';
import { logError } from '#lib/server/error-log.ts';
import { limitKindOf } from '#lib/server/rate-limit-kinds.ts';
import { tooManyRequests, withinLimit } from '#lib/server/rate-limit.ts';
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

/**
 * Private app (#109): without access, everything except invitations leads to the password
 * page. Devices that already belong to someone in a group are let in (and remembered).
 */
const handleAccess: Handle = async ({ event, resolve }) => {
	if (isOpenPath(event.url.pathname) || (await hasAccess(event.cookies))) return resolve(event);
	if (await findPerson(event.locals.db, event.locals.deviceKey)) {
		await grantAccess(event.cookies);
		return resolve(event);
	}
	// Come back to the page itself afterwards, not to its data request
	const next = event.isDataRequest
		? event.url.pathname.replace(/\/__data\.json$/, '') || '/'
		: `${event.url.pathname}${event.url.search}`;
	redirect(303, `${resolveRoute('/welcome')}?${new URLSearchParams({ next })}`);
};

/**
 * Rate limits per address (#66): changes and guessing secrets are counted. Last in the
 * sequence, so the answer is in the visitor's language.
 */
const handleRateLimit: Handle = async ({ event, resolve }) => {
	const kind = limitKindOf(event.request.method, event.url);
	if (kind && !(await withinLimit(kind, event.getClientAddress()))) {
		return tooManyRequests(event.request);
	}
	return resolve(event);
};

/** Every dynamic response says which release served it. */
const handleVersion: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('x-app-version', version);
	// A private app: never listed by search engines
	response.headers.set('x-robots-tag', 'noindex, nofollow');
	return response;
};

export const handle: Handle = sequence(
	handleVersion,
	handleDb,
	handleDevice,
	handleAccess,
	handleSettings,
	handleParaglide,
	handleRateLimit
);

/** Unexpected errors (not our own error() calls or 404s) are logged for monitoring (#81) */
export const handleError: HandleServerError = ({ kind, error, event }) => {
	if (kind !== 'unknown') return;
	logError({ error, route: event.route.id, method: event.request.method });
};
