import { error } from '@sveltejs/kit';
import { isSealed, keyIdIn } from '#lib/crypto/seal.ts';
import { DELETED_GROUP_DAYS } from '#lib/group/retention.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Db } from './db';
import { findGroupByToken, isDeletedGroupToken, listMembers, memberOf } from './groups';
import { once } from './request-cache';
import { findPerson } from './people';

/** The group behind a share token; 410 when it was deleted (#125), else 404. */
export async function requireGroup(db: Db, token: string) {
	const group = await findGroupByToken(db, token);
	if (group) return group;
	if (await isDeletedGroupToken(db, token))
		error(410, m.error_group_deleted({ days: DELETED_GROUP_DAYS }));
	error(404, m.error_not_found());
}

/** For loads: the group, looked up once per request (request-cache.ts) */
export const groupOf = (locals: App.Locals, token: string) =>
	once(locals, `group:${token}`, () => requireGroup(locals.db, token));

/** For loads: the group's current members, looked up once per request */
export const membersOf = (locals: App.Locals, groupId: string) =>
	once(locals, `members:${groupId}`, () => listMembers(locals.db, groupId));

/**
 * A page opened before the group was encrypted would send plain text into it (#110). Refused, so
 * the server's promise holds whatever a browser sends.
 */
export function refuseUnsealed(group: { keyId: string | null }, form: FormData) {
	if (!group.keyId) return;
	for (const name of ['title', 'notes', 'comment', 'name', 'description']) {
		const value = form.get(name);
		// Sealed with another key: a page from before the group's key was changed
		if (
			typeof value === 'string' &&
			value.trim() &&
			(!isSealed(value) || keyIdIn(value) !== group.keyId)
		) {
			error(409, m.locked_reload());
		}
	}
}

/**
 * Form data, group, the device's person and the member they act as, for a form
 * submission by a member of the group. The actor comes from the device identity, never
 * from the form (A-5).
 */
export async function formContext(locals: App.Locals, token: string, request: Request) {
	const form = await request.formData();
	const group = await requireGroup(locals.db, token);
	refuseUnsealed(group, form);
	const person = await findPerson(locals.db, locals.deviceKey);
	const actorId = await memberOf(locals.db, group.id, person?.id);
	// Joining comes first: every change has a member behind it
	if (!actorId) error(403, m.error_not_a_member());
	if (group.keyId) {
		const sealed = /(?:^|; )sealed-actor=([^;]+)/.exec(request.headers.get('cookie') ?? '')?.[1];
		if (isSealed(sealed) && keyIdIn(sealed) === group.keyId) {
			locals.sealActivity = { groupId: group.id, memberId: actorId, sealed };
		}
	}
	return { form, group, person, actorId };
}
