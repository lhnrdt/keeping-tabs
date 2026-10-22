import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { useDeviceLink } from '#lib/server/people.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	/** Makes this browser the same person as the device that created the link (A-14) */
	use: async ({ locals, request }) => {
		const token = String((await request.formData()).get('token') ?? '');
		if (!(await useDeviceLink(locals.db, token, locals.deviceKey))) {
			return fail(400, { error: 'device_link_invalid' as ErrorCode });
		}
		redirect(303, resolve('/'));
	}
};
