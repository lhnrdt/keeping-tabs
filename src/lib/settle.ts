// Suggested payments to settle a group (B-2), simplified or direct (B-6).
import { balances, type BalanceInput } from './money';

export type Transfer = { from: string; to: string; amountCents: number };

/**
 * Greedily matches the biggest debtor with the biggest creditor until everyone is
 * even. Each step settles at least one person, so there are at most n−1 transfers.
 * Ties are broken by member order, so the result is deterministic.
 */
export function suggestTransfers(balances: ReadonlyMap<string, number>): Transfer[] {
	const order = [...balances.keys()];
	const byAmountThenOrder = (a: [string, number], b: [string, number]) =>
		b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]);

	const creditors = [...balances].filter(([, amount]) => amount > 0).sort(byAmountThenOrder);
	const debtors = [...balances]
		.filter(([, amount]) => amount < 0)
		.map(([id, amount]): [string, number] => [id, -amount])
		.sort(byAmountThenOrder);

	const transfers: Transfer[] = [];
	while (creditors.length && debtors.length) {
		const [creditor, owed] = creditors[0];
		const [debtor, owes] = debtors[0];
		const amountCents = Math.min(owed, owes);
		transfers.push({ from: debtor, to: creditor, amountCents });
		creditors[0] = [creditor, owed - amountCents];
		debtors[0] = [debtor, owes - amountCents];
		if (creditors[0][1] === 0) creditors.shift();
		if (debtors[0][1] === 0) debtors.shift();
		creditors.sort(byAmountThenOrder);
		debtors.sort(byAmountThenOrder);
	}
	return transfers;
}

/**
 * Who pays whom back without rerouting (B-6 off): each member pays each person they owe
 * directly, netted per pair. Payments count like expenses: the recipient's split means
 * the payer is owed less. Ordered by member order, so the result is deterministic.
 */
export function directTransfers(
	memberIds: readonly string[],
	entries: readonly BalanceInput[]
): Transfer[] {
	const owes = new Map<string, number>();
	const key = (from: string, to: string) => `${from}>${to}`;
	for (const { paidBy, splits } of entries) {
		for (const { memberId, shareCents } of splits) {
			if (memberId === paidBy) continue;
			owes.set(key(memberId, paidBy), (owes.get(key(memberId, paidBy)) ?? 0) + shareCents);
		}
	}
	const transfers: Transfer[] = [];
	memberIds.forEach((a, i) => {
		for (const b of memberIds.slice(i + 1)) {
			const net = (owes.get(key(a, b)) ?? 0) - (owes.get(key(b, a)) ?? 0);
			if (net > 0) transfers.push({ from: a, to: b, amountCents: net });
			if (net < 0) transfers.push({ from: b, to: a, amountCents: -net });
		}
	});
	return transfers;
}

/** The group's payments to settle up, following its "simplify debts" setting. */
export const settleTransfers = (
	simplify: boolean,
	memberIds: readonly string[],
	entries: readonly BalanceInput[]
) =>
	simplify ? suggestTransfers(balances(memberIds, entries)) : directTransfers(memberIds, entries);
