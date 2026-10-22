import { balances } from '#lib/money.ts';
import type { Db } from './db';
import { listExpenses } from './expenses';
import { listGroupsOf } from './groups';

/** Your groups with your balance in each, for the home screen (A-17, SP-5). */
export async function yourGroupsWithBalances(db: Db, personId: string) {
	const groups = await listGroupsOf(db, personId);
	return Promise.all(
		groups.map(async ({ memberId, ...group }) => {
			// The same balance calculation as the group screen
			const totals = balances([memberId], await listExpenses(db, group.id));
			return { ...group, balance: totals.get(memberId) ?? 0 };
		})
	);
}
