import { error, fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { m } from '#lib/paraglide/messages.js';
import {
	addMember,
	findGroupByToken,
	isUniqueViolation,
	listMembers,
	regenerateShareToken,
	renameMember,
	resolveActor,
	updateGroup
} from '#lib/server/groups.ts';
import { parseDescription, parseGroupName, parseMemberName } from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

async function loadGroup(db: App.Locals['db'], token: string) {
	const group = await findGroupByToken(db, token);
	if (!group) error(404, m.error_not_found());
	return group;
}

/** Group and acting member for a form submission. */
async function context(locals: App.Locals, token: string, request: Request) {
	const form = await request.formData();
	const group = await loadGroup(locals.db, token);
	const actorId = await resolveActor(locals.db, group.id, form.get('actor'));
	return { form, group, actorId };
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const group = await loadGroup(locals.db, params.token);
	return { group, members: await listMembers(locals.db, group.id) };
};

export const actions: Actions = {
	updateGroup: async ({ locals, params, request }) => {
		const { form, group, actorId } = await context(locals, params.token, request);
		const invalid = (error: ErrorCode) => fail(400, { action: 'updateGroup' as const, error });

		const name = parseGroupName(form.get('name'));
		if (!name.ok) return invalid(name.error);
		const description = parseDescription(form.get('description'));
		if (!description.ok) return invalid(description.error);

		await updateGroup(locals.db, group.id, actorId, {
			name: name.value,
			description: description.value
		});
	},

	addMember: async ({ locals, params, request }) => {
		const { form, group, actorId } = await context(locals, params.token, request);
		const invalid = (error: ErrorCode) => fail(400, { action: 'addMember' as const, error });

		const members = await listMembers(locals.db, group.id);
		const name = parseMemberName(
			form.get('name'),
			members.map((member) => member.name)
		);
		if (!name.ok) return invalid(name.error);

		try {
			await addMember(locals.db, group.id, actorId, name.value);
		} catch (e) {
			if (isUniqueViolation(e)) return invalid('member_name_taken');
			throw e;
		}
	},

	renameMember: async ({ locals, params, request }) => {
		const { form, group, actorId } = await context(locals, params.token, request);
		const memberId = String(form.get('memberId') ?? '');
		const invalid = (error: ErrorCode) =>
			fail(400, { action: 'renameMember' as const, error, memberId });

		const members = await listMembers(locals.db, group.id);
		const member = members.find((other) => other.id === memberId);
		if (!member) return invalid('member_not_found');
		const name = parseMemberName(
			form.get('name'),
			members.filter((other) => other.id !== memberId).map((other) => other.name)
		);
		if (!name.ok) return invalid(name.error);
		if (name.value === member.name) return;

		try {
			await renameMember(locals.db, group.id, actorId, memberId, name.value, member.name);
		} catch (e) {
			if (isUniqueViolation(e)) return invalid('member_name_taken');
			throw e;
		}
	},

	regenerateLink: async ({ locals, params, request }) => {
		const { group, actorId } = await context(locals, params.token, request);
		const token = await regenerateShareToken(locals.db, group.id, actorId);
		redirect(303, resolve('/g/[token]', { token }));
	}
};
