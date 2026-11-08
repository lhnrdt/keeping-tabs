import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { isKey, isSealed } from '#lib/crypto/seal.ts';
import { countPasskeys, countPasskeysWithoutVault } from '#lib/server/passkeys.ts';
import {
	ensurePerson,
	findPerson,
	hasRecoveryKey,
	recoveryKeyIsOutdated,
	saveRecoveryKey
} from '#lib/server/people.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	// Nothing to back up yet; this device might be someone returning, though
	if (!person) redirect(303, resolve('/you/devices'));
	const [passkeyCount, withoutVault, recoveryKey, outdated] = await Promise.all([
		countPasskeys(locals.db, person.id),
		countPasskeysWithoutVault(locals.db, person.id),
		hasRecoveryKey(locals.db, person.id),
		recoveryKeyIsOutdated(locals.db, person.id)
	]);
	return {
		passkeyCount,
		passkeysWithoutVault: withoutVault,
		hasRecoveryKey: recoveryKey,
		recoveryKeyOutdated: outdated
	};
};

export const actions: Actions = {
	/** A new recovery key, made and shown once in the browser (A-16) */
	createRecoveryKey: async ({ locals, request }) => {
		const form = await request.formData();
		const proof = form.get('recoveryProof');
		const vault = form.get('recoveryVault');
		if (!isKey(proof) || !isSealed(vault)) error(400);
		const person = await ensurePerson(locals.db, locals.deviceKey);
		await saveRecoveryKey(locals.db, person.id, proof, vault);
		return { recoveryCreated: true };
	}
};
