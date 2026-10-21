import { error } from '@sveltejs/kit';
import { m } from '#lib/paraglide/messages.js';
import type { Db } from './db';
import { findGroupByToken, resolveActor } from './groups';

/** The group behind a share token, or a 404. */
export async function requireGroup(db: Db, token: string) {
	const group = await findGroupByToken(db, token);
	if (!group) error(404, m.error_not_found());
	return group;
}

/** Form data, group and acting member for a form submission. */
export async function formContext(locals: App.Locals, token: string, request: Request) {
	const form = await request.formData();
	const group = await requireGroup(locals.db, token);
	const actorId = await resolveActor(locals.db, group.id, form.get('actor'));
	return { form, group, actorId };
}
