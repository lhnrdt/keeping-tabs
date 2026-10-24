import { balances } from '#lib/money.ts';
import { summarizePeople } from '#lib/people-summary.ts';
import { settleTransfers } from '#lib/settle.ts';
import type { Db } from './db';
import { listExpenses } from './expenses';
import { listGroupsOf, listMembers } from './groups';

/**
 * The home screen's numbers, in one pass over your groups: your balance in each (A-17,
 * SP-5) and, across groups, who owes you and whom you owe (#117). The same calculation as
 * the group screen.
 */
export async function homeOverview(db: Db, personId: string) {
	const groups = await listGroupsOf(db, personId);
	const settled = await Promise.all(
		groups.map(async ({ simplifyDebts, ...group }) => {
			const [members, expenses] = await Promise.all([
				listMembers(db, group.id),
				listExpenses(db, group.id)
			]);
			const memberIds = members.map((member) => member.id);
			return {
				...group,
				members,
				balance: balances([group.memberId], expenses).get(group.memberId) ?? 0,
				transfers: settleTransfers(simplifyDebts, memberIds, expenses)
			};
		})
	);
	return {
		yourGroups: settled.map(({ id, name, token, currency, kind, tint, balance }) => ({
			id,
			name,
			token,
			currency,
			kind,
			tint,
			balance
		})),
		people: summarizePeople(settled)
	};
}
