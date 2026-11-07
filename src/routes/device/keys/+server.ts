// A person's sealed keys (#110): sealed in their browsers, opened only there.
import { error, json } from '@sveltejs/kit';
import { isSealed } from '#lib/crypto/seal.ts';
import { findPerson } from '#lib/server/people.ts';
import { keysOf, storeKeys, storeRecoveryVault, storeVault } from '#lib/server/person-keys.ts';
import type { RequestHandler } from './$types';

const KEY_ID = /^[\w-]{8}$/;
const PUBLIC_KEY = /^[\w-]{43}$/;
const MAX_KEYS = 200;

export const GET: RequestHandler = async ({ locals }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	if (!person) return json({ keys: [], recoveryVault: null, vaults: [] });
	return json(await keysOf(locals.db, person.id));
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	if (!person) return json({ ok: false });
	const body = (await request.json().catch(() => null)) as {
		keys?: { keyId?: unknown; sealed?: unknown }[];
		recoveryVault?: unknown;
		vault?: { vaultId?: unknown; publicKey?: unknown };
	} | null;
	if (!body) error(400);
	if (body.recoveryVault !== undefined) {
		if (!isSealed(body.recoveryVault)) error(400);
		await storeRecoveryVault(locals.db, person.id, body.recoveryVault);
	}
	if (body.vault !== undefined) {
		const { vaultId, publicKey } = body.vault ?? {};
		if (
			typeof vaultId !== 'string' ||
			!KEY_ID.test(vaultId) ||
			typeof publicKey !== 'string' ||
			!PUBLIC_KEY.test(publicKey)
		)
			error(400);
		await storeVault(locals.db, person.id, { vaultId, publicKey });
	}
	if (body.keys !== undefined) {
		const valid =
			Array.isArray(body.keys) &&
			body.keys.length <= MAX_KEYS &&
			body.keys.every(
				(key) => typeof key.keyId === 'string' && KEY_ID.test(key.keyId) && isSealed(key.sealed)
			);
		if (!valid) error(400);
		await storeKeys(locals.db, person.id, body.keys as { keyId: string; sealed: string }[]);
	}
	return json({ ok: true });
};
