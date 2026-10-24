import { balances } from '#lib/money.ts';
import { betweenYou, summarizePeople } from '#lib/people-summary.ts';
import { settleTransfers } from '#lib/settle.ts';
import type { Db } from './db';
import { listExpenses } from './expenses';
import { listGroupsOf, listMembers } from './groups';

type YourGroup = Awaited<ReturnType<typeof listGroupsOf>>[number];

/** A group's members, entries and settle-up payments: the same calculation as its screen */
async function settle(db: Db, group: YourGroup) {
	const [members, expenses] = await Promise.all([
		listMembers(db, group.id),
		listExpenses(db, group.id)
	]);
	const memberIds = members.map((member) => member.id);
	return {
		members,
		expenses,
		transfers: settleTransfers(group.simplifyDebts, memberIds, expenses)
	};
}

/**
 * Your groups for the start screen (A-17, SP-5): your balance in each and, per person, what's
 * open between you there (#117), e.g. "Ben owes you €30.00".
 */
export async function yourGroupsWithBalances(db: Db, personId: string) {
	const groups = await listGroupsOf(db, personId);
	return Promise.all(
		groups.map(async (group) => {
			const { members, expenses, transfers } = await settle(db, group);
			const names = new Map(members.map((member) => [member.id, member.name]));
			const { id, name, token, currency, kind, tint, memberId } = group;
			return {
				id,
				name,
				token,
				currency,
				kind,
				tint,
				balance: balances([memberId], expenses).get(memberId) ?? 0,
				open: betweenYou(transfers, memberId).map(({ memberId: other, amount }) => ({
					name: names.get(other) ?? '?',
					amount
				}))
			};
		})
	);
}

/** Across your groups: who owes you and whom you owe (#117) */
export async function peopleOverview(db: Db, personId: string) {
	const groups = await listGroupsOf(db, personId);
	const settled = await Promise.all(
		groups.map(async (group) => ({ ...group, ...(await settle(db, group)) }))
	);
	return summarizePeople(settled);
}
