import { env } from 'cloudflare:workers';
import { version } from '$app/env';
import type { Handle } from '@sveltejs/kit/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { getDb } from '#lib/server/db/index.ts';

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

/** Every dynamic response says which release served it. */
const handleVersion: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('x-app-version', version);
	return response;
};

export const handle: Handle = sequence(handleVersion, handleDb, handleParaglide);
