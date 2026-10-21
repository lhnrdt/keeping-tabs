// Suggested payments to settle a group (B-2).

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
