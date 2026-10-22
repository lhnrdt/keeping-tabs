import { error } from '@sveltejs/kit';
import { m } from '#lib/paraglide/messages.js';
import type { Db } from './db';
import { findGroupByToken, memberOf } from './groups';
import { findPerson } from './people';

/** The group behind a share token, or a 404. */
export async function requireGroup(db: Db, token: string) {
	const group = await findGroupByToken(db, token);
	if (!group) error(404, m.error_not_found());
	return group;
}

/**
 * Form data, group, the device's person and the member they act as, for a form
 * submission. The actor comes from the device identity, never from the form (A-5).
 */
export async function formContext(locals: App.Locals, token: string, request: Request) {
	const form = await request.formData();
	const group = await requireGroup(locals.db, token);
	const person = await findPerson(locals.db, locals.deviceKey);
	const actorId = await memberOf(locals.db, group.id, person?.id);
	return { form, group, person, actorId };
}
