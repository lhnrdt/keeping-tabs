// A passkey's sealed copy of the person's vault key (#110): sealed in the browser with a secret only
// that passkey can produce.
import { error, json } from '@sveltejs/kit';
import { isSealed } from '#lib/crypto/seal.ts';
import { saveSealedVault } from '#lib/server/passkeys.ts';
import { findPerson } from '#lib/server/people.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	if (!person) error(403);
	const body = (await request.json().catch(() => null)) as {
		id?: unknown;
		sealedVault?: unknown;
	} | null;
	if (typeof body?.id !== 'string' || !isSealed(body.sealedVault)) error(400);
	await saveSealedVault(locals.db, person.id, body.id, body.sealedVault);
	return json({ ok: true });
};
