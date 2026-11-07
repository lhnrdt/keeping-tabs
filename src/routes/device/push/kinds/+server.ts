// Which kinds of notifications this person gets (#267): the ones switched off are kept.
import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { people } from '#lib/server/db/schema.ts';
import { findPerson } from '#lib/server/people.ts';
import { isPushKind } from '#lib/server/push.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { muted } = (await request.json().catch(() => ({}))) as { muted?: unknown };
	if (!Array.isArray(muted) || !muted.every(isPushKind)) error(400);
	const person = await findPerson(locals.db, locals.deviceKey);
	if (!person) error(404);
	await locals.db
		.update(people)
		.set({ pushMuted: [...new Set(muted)].join(',') || null })
		.where(eq(people.id, person.id));
	return json({ ok: true });
};
