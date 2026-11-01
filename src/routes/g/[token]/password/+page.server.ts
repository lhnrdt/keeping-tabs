// Set, change or remove the group's password (A-10): open to everyone in the group.
import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { groupTabUrl } from '#lib/group/tabs.ts';
import { formContext } from '#lib/server/context.ts';
import {
	hashGroupPassword,
	rememberUnlocked,
	setGroupPassword
} from '#lib/server/group-password.ts';
import { parseGroupPassword } from '#lib/validation.ts';
import type { Actions } from './$types';

const groupTab = (token: string) => groupTabUrl(resolve('/g/[token]', { token }), 'group');

export const actions: Actions = {
	save: async ({ locals, params, request, cookies }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const password = parseGroupPassword(form.get('password'));
		if (!password.ok) return fail(400, { error: password.error });
		const hash = await hashGroupPassword(password.value);
		await setGroupPassword(locals.db, group.id, actorId, hash);
		// Whoever sets it isn't asked for it
		await rememberUnlocked(cookies, group.id, hash);
		redirect(303, groupTab(params.token));
	},

	remove: async ({ locals, params, request }) => {
		const { group, actorId } = await formContext(locals, params.token, request);
		await setGroupPassword(locals.db, group.id, actorId, null);
		redirect(303, groupTab(params.token));
	}
};
