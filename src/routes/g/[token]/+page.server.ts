import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { balances } from '#lib/money.ts';
import { formContext as context } from '#lib/server/context.ts';
import { listExpenses } from '#lib/server/expenses.ts';
import {
	addMember,
	isUniqueViolation,
	listMembers,
	regenerateShareToken,
	renameMember,
	updateGroup
} from '#lib/server/groups.ts';
import { parseDescription, parseGroupName, parseMemberName } from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { group, members } = await parent();
	const expenses = await listExpenses(locals.db, group.id);
	const totals = balances(
		members.map((member) => member.id),
		expenses
	);
	return {
		balances: Object.fromEntries(totals),
		expenses: expenses.map(({ id, title, amountCents, paidBy, date }) => ({
			id,
			title,
			amountCents,
			paidBy,
			date
		}))
	};
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
