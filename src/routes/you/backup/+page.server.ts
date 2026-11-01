import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { countPasskeys } from '#lib/server/passkeys.ts';
import { createRecoveryKey, ensurePerson, findPerson, hasRecoveryKey } from '#lib/server/people.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	// Nothing to back up yet; this device might be someone returning, though
	if (!person) redirect(303, resolve('/you/devices'));
	const [passkeyCount, recoveryKey] = await Promise.all([
		countPasskeys(locals.db, person.id),
		hasRecoveryKey(locals.db, person.id)
	]);
	return { passkeyCount, hasRecoveryKey: recoveryKey };
};

export const actions: Actions = {
	/** A new recovery key, shown once (A-16) */
	createRecoveryKey: async ({ locals }) => {
		const person = await ensurePerson(locals.db, locals.deviceKey);
		return { recoveryKey: await createRecoveryKey(locals.db, person.id) };
	}
};
