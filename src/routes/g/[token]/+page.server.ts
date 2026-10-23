import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { shownCount } from '#lib/group/expense-pages.ts';
import { balances } from '#lib/money.ts';
import { settleTransfers } from '#lib/settle.ts';
import { formContext as context, requireGroup } from '#lib/server/context.ts';
import { entryPage } from '#lib/server/expense-entries.ts';
import { listExpenses } from '#lib/server/expenses.ts';
import { joinGroup, letJoinAgain, removeMember, stepBack } from '#lib/server/membership.ts';
import {
	addMember,
	isUniqueViolation,
	listMembers,
	regenerateShareToken,
	renameMember,
	updateGroup
} from '#lib/server/groups.ts';
import { ensurePerson, setProfileName } from '#lib/server/people.ts';
import {
	parseDescription,
	parseGroupName,
	parseKind,
	parseMemberName,
	parseTint
} from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	const { group, members } = await parent();
	const shown = shownCount(url.searchParams.get('show'));
	// Balances and settling up need everything; the list only its first page(s)
	const [expenses, page] = await Promise.all([
		listExpenses(locals.db, group.id),
		entryPage(locals.db, group.id, members.find((member) => member.mine)?.id ?? null, 0, shown)
	]);
	const memberIds = members.map((member) => member.id);
	return {
		balances: Object.fromEntries(balances(memberIds, expenses)),
		transfers: settleTransfers(group.simplifyDebts, memberIds, expenses),
		entries: page.entries,
		hasMore: page.hasMore
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
		const kind = parseKind(form.get('kind'));
		if (!kind.ok) return invalid(kind.error);
		const tint = parseTint(form.get('tint'));
		if (!tint.ok) return invalid(tint.error);

		await updateGroup(locals.db, group.id, actorId, {
			name: name.value,
			description: description.value,
			kind: kind.value,
			tint: tint.value,
			// A checkbox: present when on
			simplifyDebts: form.get('simplifyDebts') === 'on'
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
	},

	/** Join as an open spot (memberId) or under a name; no membership needed for this one */
	join: async ({ locals, params, request }) => {
		const form = await request.formData();
		const group = await requireGroup(locals.db, params.token);
		const person = await ensurePerson(locals.db, locals.deviceKey);
		const memberId = form.get('memberId')?.toString();
		const joined = await joinGroup(
			locals.db,
			group.id,
			person.id,
			memberId ? { memberId } : { name: form.get('name') }
		);
		if (!joined.ok) return fail(400, { action: 'join' as const, error: joined.error });
		// The first name you use becomes your profile name (A-13)
		if (!person.name) await setProfileName(locals.db, person.id, joined.value.name);
	},

	/** "Not you?": step back while you haven't taken part yet */
	stepBack: async ({ locals, params, request }) => {
		const { group, actorId } = await context(locals, params.token, request);
		const result = await stepBack(locals.db, group.id, actorId);
		if (!result.ok) return fail(400, { action: 'stepBack' as const, error: result.error });
	},

	/** Someone lost access: their member is open again so they can rejoin */
	letJoinAgain: async ({ locals, params, request }) => {
		const { form, group, actorId } = await context(locals, params.token, request);
		await letJoinAgain(locals.db, group.id, actorId, String(form.get('memberId') ?? ''));
	},

	removeMember: async ({ locals, params, request }) => {
		const { form, group, actorId } = await context(locals, params.token, request);
		const result = await removeMember(
			locals.db,
			group.id,
			actorId,
			String(form.get('memberId') ?? '')
		);
		if (!result.ok) return fail(400, { action: 'removeMember' as const, error: result.error });
	}
};
