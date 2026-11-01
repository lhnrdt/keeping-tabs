import { spendingWithCategories } from '#lib/insights/across.ts';
import { balances } from '#lib/money.ts';
import { betweenYou, summarizePeople } from '#lib/people-summary.ts';
import { settleTransfers } from '#lib/settle.ts';
import type { Db } from './db';
import { lastEntryDate, listExpenses, listLedger } from './expenses';
import { shouldEncrypt } from './encryption-handover';
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
			const [{ members, ledger, transfers }, lastEntry] = await Promise.all([
				settle(db, group),
				lastEntryDate(db, group.id)
			]);
			const names = new Map(members.map((member) => [member.id, member.name]));
			const { id, name, token, currency, kind, tint, memberId, simplifyDebts } = group;
			// Encrypted, or on its way: worked out in the browser from all entries (#110)
			const sealed =
				group.keyId || group.transitionKey
					? { members, memberId, simplifyDebts, expenses: await listExpenses(db, id) }
					: null;
			return {
				sealed,
				sealedDetails: group.sealedDetails,
				encryptNow: shouldEncrypt(group, true),
				id,
				name,
				token,
				currency,
				kind,
				tint,
				balance: balances([memberId], ledger).get(memberId) ?? 0,
				lastEntry,
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
	const spendingGroups = settled.map((group) => ({ ...group, entries: group.expenses }));
	// With an encrypted group among them the browser works it out, since it takes categories only
	// it can read (#110)
	const anySealed = groups.some((group) => group.keyId || group.transitionKey);
	return {
		people: anySealed ? [] : summarizePeople(settled),
		spending: anySealed ? null : spendingWithCategories(spendingGroups),
		sealedSpending: anySealed ? spendingGroups : null
	};
}
