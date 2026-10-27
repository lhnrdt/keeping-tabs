import { error, json } from '@sveltejs/kit';
import { takeChallenge } from '#lib/server/passkey-challenge.ts';
import { relyingPartyFor, verifyPasskey } from '#lib/server/passkeys.ts';
import { attachDevice } from '#lib/server/people.ts';
import { checkSettingsAgain } from '#lib/server/settings.ts';
import type { RequestHandler } from './$types';

/** Makes this device the person behind a verified passkey (A-18) */
export const POST: RequestHandler = async ({ locals, url, cookies, request }) => {
	const challenge = await takeChallenge(locals.db, cookies);
	if (!challenge) error(403);
	const personId = await verifyPasskey(
		locals.db,
		relyingPartyFor(url),
		await request.json(),
		challenge
	).catch(() => null);
	if (!personId) error(401);
	await attachDevice(locals.db, locals.deviceKey, personId);
	checkSettingsAgain(cookies);
	return json({ restored: true });
};
