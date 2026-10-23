// Accepting the friendly note (#112): a plain form post, then back to the page.
import { redirect } from '@sveltejs/kit';
import { safePath } from '#lib/safe-redirect.ts';
import { acceptNote } from '#lib/server/note.ts';
import { findPerson } from '#lib/server/people.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies, request }) => {
	const form = await request.formData();
	await acceptNote(locals.db, cookies, await findPerson(locals.db, locals.deviceKey));
	redirect(303, safePath(form.get('next')));
};
