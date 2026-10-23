import { fail, redirect } from '@sveltejs/kit';
import { safePath } from '#lib/safe-redirect.ts';
import { grantAccess, hasAccess, isAccessPassword } from '#lib/server/access.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
	if (await hasAccess(cookies)) redirect(303, safePath(url.searchParams.get('next')));
};

export const actions: Actions = {
	default: async ({ cookies, request, url }) => {
		const form = await request.formData();
		if (!(await isAccessPassword(form.get('password')))) return fail(400, { wrong: true });
		await grantAccess(cookies);
		redirect(303, safePath(url.searchParams.get('next')));
	}
};
