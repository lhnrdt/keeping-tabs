import { error, json } from '@sveltejs/kit';
import { setChallenge } from '#lib/server/passkey-challenge.ts';
import { registrationOptions, relyingPartyFor } from '#lib/server/passkeys.ts';
import { findPerson } from '#lib/server/people.ts';
import type { RequestHandler } from './$types';

/** Options for saving a passkey for this device's person */
export const POST: RequestHandler = async ({ locals, url, cookies }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	if (!person) error(403);
	const options = await registrationOptions(locals.db, relyingPartyFor(url), person);
	setChallenge(cookies, options.challenge);
	return json(options);
};
