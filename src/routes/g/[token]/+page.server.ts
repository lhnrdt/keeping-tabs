import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { todayInputValue } from '#lib/dates.ts';
import type { ErrorCode } from '#lib/errors.ts';
import { shownCount } from '#lib/group/expense-pages.ts';
import { readQuery } from '#lib/group/search.ts';
import { currentTab, UNDO_PARAM } from '#lib/group/tabs.ts';
import { groupInsights } from '#lib/insights/group.ts';
import { defaultPeriod, parsePeriod } from '#lib/insights/period.ts';
import { choiceToStore, isSection } from '#lib/insights/sections.ts';
import { balances, parseAmount } from '#lib/money.ts';
import { settleTransfers } from '#lib/settle.ts';
import { formContext as context, groupOf, membersOf, requireGroup } from '#lib/server/context.ts';
import { entryPage } from '#lib/server/expense-entries.ts';
import { findDeletedEntry, listExpenses, listLedger, restoreEntry } from '#lib/server/expenses.ts';
import { deleteGroup } from '#lib/server/group-deletion.ts';
import { joinGroup, letJoinAgain, removeMember, stepBack } from '#lib/server/membership.ts';
import {
	addMember,
	isUniqueViolation,
	listMembers,
	regenerateShareToken,
	setBudget,
	setDefaultSplit,
	setInsightSections,
	renameMember,
	updateGroup
} from '#lib/server/groups.ts';
import { ensurePerson, personOf, setProfileName } from '#lib/server/people.ts';
import { addDueRecurring, listRecurring, stopRecurring } from '#lib/server/recurring.ts';
import {
	parseDescription,
	parseGroupName,
	parseKind,
	parseDate,
	parseMemberName,
	parseTint
} from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	// Shared with the layout but not waiting for it (#58)
	const group = await groupOf(locals, params.token);
	const [members, person] = await Promise.all([membersOf(locals, group.id), personOf(locals)]);
	const mine = members.find((member) => person && member.personId === person.id)?.id ?? null;
	// Repeating expenses due by today are added before anything is shown (#45)
	await addDueRecurring(locals.db, todayInputValue(), group.id);
	const shown = shownCount(url.searchParams.get('show'));
	const query = readQuery(url.searchParams);
	// Balances and settling up need only sums (#58), the list its first page(s); every entry
	// only for the insights
	const deletedId = url.searchParams.get(UNDO_PARAM);
	const onInsights = currentTab(url) === 'insights';
	const [ledger, expenses, page, justDeleted, recurring] = await Promise.all([
		listLedger(locals.db, group.id),
		onInsights ? listExpenses(locals.db, group.id) : undefined,
		entryPage(locals.db, group.id, mine, 0, shown, query),
		// Right after deleting: offer "Undo" (#78); gone once it's restored
		deletedId ? findDeletedEntry(locals.db, group.id, deletedId) : undefined,
		currentTab(url) === 'group' ? listRecurring(locals.db, group.id) : []
	]);
	const memberIds = members.map((member) => member.id);
	const today = todayInputValue();
	const transfers = settleTransfers(group.simplifyDebts, memberIds, ledger);
	return {
		balances: Object.fromEntries(balances(memberIds, ledger)),
		transfers,
		entries: page.entries,
		hasMore: page.hasMore,
		justDeleted: justDeleted ?? null,
		recurring,
		query,
		today,
		// Only on its tab: everything else doesn't need it (#161)
		insights:
			onInsights && expenses
				? groupInsights(
						expenses,
						memberIds,
						mine,
						transfers,
						{ budget: group.budgetCents, endsOn: group.endsOn },
						today,
						parsePeriod(url.searchParams, defaultPeriod(group.kind, today))
					)
				: null
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

	/** Soft delete: the group disappears for everyone and can be restored for a while (G-3) */
	deleteGroup: async ({ locals, params, request }) => {
		const { group, actorId } = await context(locals, params.token, request);
		await deleteGroup(locals.db, group.id, actorId);
		redirect(303, resolve('/'));
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

	/** "Undo" right after deleting an expense or payment (#78) */
	restoreEntry: async ({ locals, params, request }) => {
		const { form, group, actorId } = await context(locals, params.token, request);
		const entry = await findDeletedEntry(locals.db, group.id, String(form.get('entryId') ?? ''));
		if (entry) await restoreEntry(locals.db, group.id, actorId, entry);
	},

	/** A repeating expense stops; what it added stays (#45) */
	stopRecurring: async ({ locals, params, request }) => {
		const { form, group, actorId } = await context(locals, params.token, request);
		await stopRecurring(locals.db, group.id, actorId, String(form.get('recurringId') ?? ''));
	},

	/** New expenses go back to an equal split (#41) */
	clearDefaultSplit: async ({ locals, params, request }) => {
		const { group, actorId } = await context(locals, params.token, request);
		await setDefaultSplit(locals.db, group.id, actorId, null);
	},

	/** Which insights the group shows (#174); "reset" goes back to the type's suggestions */
	insightSections: async ({ locals, params, request, url }) => {
		const { form, group, actorId } = await context(locals, params.token, request);
		const chosen = url.searchParams.has('reset') ? [] : form.getAll('section').filter(isSection);
		await setInsightSections(locals.db, group.id, actorId, choiceToStore(group.kind, chosen));
	},

	/** A budget and end date for the insights (#168); "remove" clears both */
	budget: async ({ locals, params, request, url }) => {
		const { form, group, actorId } = await context(locals, params.token, request);
		const invalid = (error: ErrorCode) => fail(400, { action: 'budget' as const, error });
		if (url.searchParams.has('remove')) {
			await setBudget(locals.db, group.id, actorId, { budgetCents: null, endsOn: null });
			return;
		}
		const amount = String(form.get('amount') ?? '').trim();
		const budgetCents = amount ? parseAmount(amount, group.currency) : null;
		if (amount && budgetCents === null) return invalid('amount_invalid');
		const date = String(form.get('endsOn') ?? '').trim();
		const endsOn = date ? parseDate(date) : null;
		if (endsOn && !endsOn.ok) return invalid(endsOn.error);
		await setBudget(locals.db, group.id, actorId, {
			budgetCents,
			endsOn: endsOn?.ok ? endsOn.value : null
		});
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
