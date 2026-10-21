import { describe, expect, it } from 'vitest';
import { suggestTransfers, type Transfer } from './settle';

const settle = (balances: Record<string, number>) =>
	suggestTransfers(new Map(Object.entries(balances)));

/** Applies transfers to balances; everyone should end at zero. */
function apply(balances: Record<string, number>, transfers: Transfer[]) {
	const result = { ...balances };
	for (const { from, to, amountCents } of transfers) {
		result[from] += amountCents;
		result[to] -= amountCents;
	}
	return result;
}

describe('suggestTransfers', () => {
	it('returns nothing when everyone is settled', () => {
		expect(settle({ a: 0, b: 0 })).toEqual([]);
	});

	it('pays the one creditor', () => {
		expect(settle({ a: 2000, b: -1000, c: -1000 })).toEqual([
			{ from: 'b', to: 'a', amountCents: 1000 },
			{ from: 'c', to: 'a', amountCents: 1000 }
		]);
	});

	it('matches biggest debts with biggest credits first', () => {
		expect(settle({ a: 700, b: 300, c: -1000 })).toEqual([
			{ from: 'c', to: 'a', amountCents: 700 },
			{ from: 'c', to: 'b', amountCents: 300 }
		]);
	});

	it('needs at most n−1 transfers and settles everyone', () => {
		const balances = { a: 1234, b: -567, c: 890, d: -1001, e: -556 };
		const transfers = settle(balances);
		expect(transfers.length).toBeLessThanOrEqual(4);
		expect(Object.values(apply(balances, transfers)).every((amount) => amount === 0)).toBe(true);
		expect(transfers.every((t) => t.amountCents > 0)).toBe(true);
	});
});
