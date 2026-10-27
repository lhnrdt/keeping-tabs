import { error, json } from '@sveltejs/kit';
import { takeChallenge } from '#lib/server/passkey-challenge.ts';
import { relyingPartyFor, savePasskey } from '#lib/server/passkeys.ts';
import { findPerson } from '#lib/server/people.ts';
import type { RequestHandler } from './$types';

/** Verifies and stores a new passkey (A-18) */
export const POST: RequestHandler = async ({ locals, url, cookies, request }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	const challenge = await takeChallenge(locals.db, cookies);
	if (!person || !challenge) error(403);
	const saved = await savePasskey(
		locals.db,
		relyingPartyFor(url),
		person.id,
		await request.json(),
		challenge
	).catch(() => false);
	if (!saved) error(400);
	return json({ saved });
};
