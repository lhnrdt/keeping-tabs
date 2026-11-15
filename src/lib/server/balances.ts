// What each member stands at in a group, from its ledger's sums (#58)
import { balances } from '#lib/money.ts';
import type { Db } from './db';
import { listLedger } from './expenses';

/** Each member's balance by id: above 0 they're owed, below 0 they owe */
export async function groupBalances(db: Db, groupId: string, memberIds: readonly string[]) {
	return Object.fromEntries(balances(memberIds, await listLedger(db, groupId)));
}

/** Encrypted, or on its way: only the browser can work out the group's money (#110) */
export const hasSealedMoney = (group: { keyId: string | null; transitionKey: string | null }) =>
	Boolean(group.keyId || group.transitionKey);

/** The balances for a page that shows them, or null where the browser works them out */
export async function balancesFor(
	db: Db,
	group: { id: string; keyId: string | null; transitionKey: string | null },
	members: readonly { id: string }[]
) {
	if (hasSealedMoney(group)) return null;
	return groupBalances(
		db,
		group.id,
		members.map((member) => member.id)
	);
}
