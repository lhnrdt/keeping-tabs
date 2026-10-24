import { fail } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { listDevices, removeDevice } from '#lib/server/devices.ts';
import { checkSettingsAgain } from '#lib/server/settings.ts';
import { countPasskeys } from '#lib/server/passkeys.ts';
import {
	createDeviceLink,
	createRecoveryKey,
	ensurePerson,
	findPerson,
	hasRecoveryKey,
	restoreWithRecoveryKey
} from '#lib/server/people.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	if (!person) return { hasIdentity: false, passkeyCount: 0, hasRecoveryKey: false, devices: [] };
	const [passkeyCount, recoveryKey, devices] = await Promise.all([
		countPasskeys(locals.db, person.id),
		hasRecoveryKey(locals.db, person.id),
		listDevices(locals.db, person.id, locals.deviceKey)
	]);
	return { hasIdentity: true, passkeyCount, hasRecoveryKey: recoveryKey, devices };
};

export const actions: Actions = {
	/** A one-time link for another device (A-14); the token travels in the URL fragment */
	createLink: async ({ locals, url }) => {
		const person = await ensurePerson(locals.db, locals.deviceKey);
		const token = await createDeviceLink(locals.db, person.id);
		return { link: `${new URL(resolve('/device/link'), url.origin).href}#${token}` };
	},

	/** A new recovery key, shown once (A-16) */
	createRecoveryKey: async ({ locals }) => {
		const person = await ensurePerson(locals.db, locals.deviceKey);
		return { recoveryKey: await createRecoveryKey(locals.db, person.id) };
	},

	/** Makes this device the person behind a recovery key (A-16) */
	restore: async ({ locals, request, cookies }) => {
		const key = String((await request.formData()).get('recoveryKey') ?? '');
		if (!(await restoreWithRecoveryKey(locals.db, key, locals.deviceKey))) {
			return fail(400, { error: 'recovery_key_invalid' as ErrorCode });
		}
		checkSettingsAgain(cookies);
		return { restored: true };
	},

	/** Another of your devices stops being you (#126) */
	removeDevice: async ({ locals, request }) => {
		const person = await findPerson(locals.db, locals.deviceKey);
		const id = String((await request.formData()).get('deviceId') ?? '');
		if (!person || !(await removeDevice(locals.db, person.id, locals.deviceKey, id))) {
			return fail(400, { error: 'device_not_found' as ErrorCode });
		}
	}
};
