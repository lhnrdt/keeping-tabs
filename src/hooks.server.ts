import { env } from 'cloudflare:workers';
import { version } from '$app/env';
import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { and, eq } from 'drizzle-orm';
import { sequence } from '@sveltejs/kit/hooks';
import { activityLog } from '#lib/server/db/schema.ts';
import { redirect } from '@sveltejs/kit';
import { resolve as resolveRoute } from '$app/paths';
import { cookieName, getTextDirection } from '#lib/paraglide/runtime.js';
import { LOCALE_COOKIE, SCENERY_COOKIE, THEME_COOKIE } from '#lib/settings.ts';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { getDb } from '#lib/server/db/index.ts';
import { grantAccess, hasAccess, isOpenPath } from '#lib/server/access.ts';
import { findGroupLock, isUnlocked } from '#lib/server/group-password.ts';
import { ensureDeviceKey } from '#lib/server/device.ts';
import { noteDeviceSeen } from '#lib/server/devices.ts';
import { logError } from '#lib/server/error-log.ts';
import { limitKindOf } from '#lib/server/rate-limit-kinds.ts';
import { tooManyRequests, withinLimit } from '#lib/server/rate-limit.ts';
import { findPerson } from '#lib/server/people.ts';
import { applySettings, markSettingsChecked, settingsChecked } from '#lib/server/settings.ts';
import { lookOf } from '#lib/server/look.ts';

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

const handleDevice: Handle = async ({ event, resolve }) => {
	event.locals.deviceKey = ensureDeviceKey(event.cookies);
	// The device's name and "last used" for your device list (#126), at most daily
	if (event.request.method === 'GET') {
		await noteDeviceSeen(
			event.locals.db,
			event.cookies,
			event.locals.deviceKey,
			event.request.headers.get('user-agent')
		);
	}
	return resolve(event);
};

/**
 * A device without the person's saved language or theme gets them on the first page (GET) it
 * opens, already rendered in that language. Devices that have both cookies, or were checked
 * in the last day, don't cost an extra lookup.
 */
const handleSettings: Handle = async ({ event, resolve }) => {
	const missing = [LOCALE_COOKIE, THEME_COOKIE, SCENERY_COOKIE].some(
		(name) => !event.cookies.get(name)
	);
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
 * The scenery and colours shown today (#332), worked out once: the page comes in those colours
 * from its first paint, and its scenes show that scenery.
 */
const handleLook: Handle = ({ event, resolve }) => {
	event.locals.look = lookOf(event.cookies);
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%kt.colors%', event.locals.look.colors)
	});
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
 * A group's password (A-9): here, before anything of the group runs, so every page, download
 * and data request behind its link is covered, new ones too.
 */
const handleGroupPassword: Handle = async ({ event, resolve }) => {
	const token = /^\/g\/([^/]+)/.exec(event.url.pathname)?.[1];
	if (!token) return resolve(event);
	const lock = await findGroupLock(event.locals.db, token);
	if (!lock?.passwordHash || (await isUnlocked(event.cookies, lock.id, lock.passwordHash))) {
		return resolve(event);
	}
	const next = `${event.url.pathname}${event.url.search}`;
	redirect(303, `${resolveRoute('/unlock/[token]', { token })}?${new URLSearchParams({ next })}`);
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

/**
 * Pages and their data are private and change whenever someone in the group does
 * something: browsers must ask the server before reusing them (#125). Responses that set
 * their own caching (e.g. the CSV export) keep it.
 */
const handleCaching: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	if (!response.headers.has('cache-control')) {
		response.headers.set('cache-control', 'private, no-cache');
	}
	return response;
};

/** Next to the CSP in vite.config.ts (#133) */
const SECURITY_HEADERS = {
	// Group links contain their secret: never send them to other sites
	'referrer-policy': 'same-origin',
	'x-content-type-options': 'nosniff',
	'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
	'strict-transport-security': 'max-age=31536000; includeSubDomains'
};

/** Every dynamic response says which release served it, and its security headers. */
const handleVersion: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('x-app-version', version);
	// A private app: never listed by search engines
	response.headers.set('x-robots-tag', 'noindex, nofollow');
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);
	return response;
};

/** An encrypted group's history keeps who did something sealed: only its people can read that */
const handleSealedHistory: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	const { sealActivity: seal, db } = event.locals;
	if (seal) {
		await db
			.update(activityLog)
			.set({ memberId: null, sealedActor: seal.sealed })
			.where(and(eq(activityLog.groupId, seal.groupId), eq(activityLog.memberId, seal.memberId)));
	}
	return response;
};

export const handle: Handle = sequence(
	handleVersion,
	handleCaching,
	handleDb,
	handleSealedHistory,
	handleDevice,
	handleAccess,
	handleGroupPassword,
	handleSettings,
	handleLook,
	handleParaglide,
	handleRateLimit
);

/** Unexpected errors (not our own error() calls or 404s) are logged for monitoring (#81) */
export const handleError: HandleServerError = ({ kind, error, event }) => {
	if (kind !== 'unknown') return;
	logError({ error, route: event.route.id, method: event.request.method });
};
