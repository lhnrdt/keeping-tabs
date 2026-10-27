import { json } from '@sveltejs/kit';
import { setChallenge } from '#lib/server/passkey-challenge.ts';
import { authenticationOptions, relyingPartyFor } from '#lib/server/passkeys.ts';
import type { RequestHandler } from './$types';

/** Options for continuing with any passkey saved for this site */
export const POST: RequestHandler = async ({ locals, url, cookies }) => {
	const options = await authenticationOptions(relyingPartyFor(url));
	await setChallenge(locals.db, cookies, options.challenge);
	return json(options);
};
