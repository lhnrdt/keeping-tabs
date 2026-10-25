import { describe, expect, it } from 'vitest';
import { ledgerEntries, type PaidSum, type ShareSum } from './ledger';
import { balances, type BalanceInput } from './money';
import { directTransfers, suggestTransfers } from './settle';

/** What the database adds up, here from the entries themselves */
function sums(entries: readonly BalanceInput[]) {
	const paid = new Map<string, number>();
	const shares = new Map<string, ShareSum>();
	for (const { paidBy, amountCents, splits } of entries) {
		paid.set(paidBy, (paid.get(paidBy) ?? 0) + amountCents);
		for (const { memberId, shareCents } of splits) {
			const key = `${paidBy}>${memberId}`;
			const row = shares.get(key) ?? { paidBy, memberId, shareCents: 0 };
			row.shareCents += shareCents;
			shares.set(key, row);
		}
	}
	const paidRows: PaidSum[] = [...paid].map(([paidBy, amountCents]) => ({ paidBy, amountCents }));
	return ledgerEntries(paidRows, [...shares.values()]);
}

const members = ['anna', 'ben', 'cara'];
const entries: BalanceInput[] = [
	{
		paidBy: 'anna',
		amountCents: 9000,
		splits: members.map((memberId) => ({ memberId, shareCents: 3000 }))
	},
	{
		paidBy: 'ben',
		amountCents: 4000,
		splits: [
			{ memberId: 'anna', shareCents: 1000 },
			{ memberId: 'cara', shareCents: 3000 }
		]
	},
	// A payment: Cara pays Anna back
	{ paidBy: 'cara', amountCents: 2000, splits: [{ memberId: 'anna', shareCents: 2000 }] },
	{ paidBy: 'anna', amountCents: 1500, splits: [{ memberId: 'ben', shareCents: 1500 }] }
];

describe('ledgerEntries', () => {
	it('gives the same balances as every entry', () => {
		expect(balances(members, sums(entries))).toEqual(balances(members, entries));
	});

	it('gives the same payments to settle up, simplified or direct', () => {
		expect(suggestTransfers(balances(members, sums(entries)))).toEqual(
			suggestTransfers(balances(members, entries))
		);
		expect(directTransfers(members, sums(entries))).toEqual(directTransfers(members, entries));
	});
});
