// The door of a password-protected group (A-9). Outside the group's own pages, so nothing about
// the group is sent before the password is right.
import { error, fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { m } from '#lib/paraglide/messages.js';
import { safePath } from '#lib/safe-redirect.ts';
import {
	findGroupLock,
	isUnlocked,
	matchesGroupPassword,
	rememberUnlocked
} from '#lib/server/group-password.ts';
import { LIMITS } from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

const nextOf = (url: URL, token: string) =>
	safePath(url.searchParams.get('next'), resolve('/g/[token]', { token }));

export const load: PageServerLoad = async ({ locals, params, url, cookies }) => {
	const lock = await findGroupLock(locals.db, params.token);
	if (!lock) error(404, m.error_not_found());
	if (!lock.passwordHash || (await isUnlocked(cookies, lock.id, lock.passwordHash))) {
		redirect(303, nextOf(url, params.token));
	}
};

export const actions: Actions = {
	default: async ({ locals, params, request, url, cookies }) => {
		const lock = await findGroupLock(locals.db, params.token);
		if (!lock) error(404, m.error_not_found());
		if (lock.passwordHash) {
			const given = String((await request.formData()).get('password') ?? '');
			const right =
				given.length <= LIMITS.groupPassword &&
				(await matchesGroupPassword(given, lock.passwordHash));
			if (!right) return fail(400, { wrong: true });
			await rememberUnlocked(cookies, lock.id, lock.passwordHash);
		}
		redirect(303, nextOf(url, params.token));
	}
};
