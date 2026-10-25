import { categoryOf, learnCategories } from '#lib/expense/learned.ts';
import { spendingAcross } from '#lib/insights/across.ts';
import { balances } from '#lib/money.ts';
import { betweenYou, summarizePeople } from '#lib/people-summary.ts';
import { settleTransfers } from '#lib/settle.ts';
import type { Db } from './db';
import { listExpenses, listLedger } from './expenses';
import { listGroupsOf, listMembers } from './groups';

type YourGroup = Awaited<ReturnType<typeof listGroupsOf>>[number];

/** A group's members, sums and settle-up payments: the same calculation as its screen (#58) */
async function settle(db: Db, group: YourGroup) {
	const [members, ledger] = await Promise.all([
		listMembers(db, group.id),
		listLedger(db, group.id)
	]);
	const memberIds = members.map((member) => member.id);
	return {
		members,
		ledger,
		transfers: settleTransfers(group.simplifyDebts, memberIds, ledger)
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
			const { members, ledger, transfers } = await settle(db, group);
			const names = new Map(members.map((member) => [member.id, member.name]));
			const { id, name, token, currency, kind, tint, memberId } = group;
			return {
				id,
				name,
				token,
				currency,
				kind,
				tint,
				balance: balances([memberId], ledger).get(memberId) ?? 0,
				open: betweenYou(transfers, memberId).map(({ memberId: other, amount }) => ({
					name: names.get(other) ?? '?',
					amount
				}))
			};
		})
	);
}

/**
 * Across your groups: who owes you and whom you owe (#117), and what you spent, by month,
 * category, group and the people you share with (#164). Each group is read once.
 */
export async function peopleOverview(db: Db, personId: string) {
	const groups = await listGroupsOf(db, personId);
	// Every entry too: the spending needs each expense's category and date
	const settled = await Promise.all(
		groups.map(async (group) => {
			const [sums, expenses] = await Promise.all([settle(db, group), listExpenses(db, group.id)]);
			return { ...group, ...sums, expenses };
		})
	);
	return {
		people: summarizePeople(settled),
		spending: spendingAcross(
			settled.map((group) => {
				// Each expense in its category as the group shows it
				const learned = learnCategories(group.expenses);
				return {
					...group,
					entries: group.expenses.map((entry) => ({
						...entry,
						category: categoryOf(entry, learned)
					}))
				};
			})
		)
	};
}
