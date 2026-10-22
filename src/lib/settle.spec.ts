import { describe, expect, it } from 'vitest';
import { directTransfers, settleTransfers, suggestTransfers, type Transfer } from './settle';

const split = (memberId: string, shareCents: number) => ({ memberId, shareCents });

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

describe('directTransfers', () => {
	// Anna paid 30 for Anna and Ben; Ben paid 30 for Ben and Cara
	const entries = [
		{ paidBy: 'a', amountCents: 3000, splits: [split('a', 1500), split('b', 1500)] },
		{ paidBy: 'b', amountCents: 3000, splits: [split('b', 1500), split('c', 1500)] }
	];

	it('pays back whom you owe, without rerouting', () => {
		expect(directTransfers(['a', 'b', 'c'], entries)).toEqual([
			{ from: 'b', to: 'a', amountCents: 1500 },
			{ from: 'c', to: 'b', amountCents: 1500 }
		]);
	});

	it('nets debts between two people and counts payments', () => {
		const payment = { paidBy: 'b', amountCents: 1000, splits: [split('a', 1000)] };
		expect(directTransfers(['a', 'b', 'c'], [...entries, payment])).toEqual([
			{ from: 'b', to: 'a', amountCents: 500 },
			{ from: 'c', to: 'b', amountCents: 1500 }
		]);
	});
});

describe('settleTransfers', () => {
	const entries = [
		{ paidBy: 'a', amountCents: 3000, splits: [split('a', 1500), split('b', 1500)] },
		{ paidBy: 'b', amountCents: 3000, splits: [split('b', 1500), split('c', 1500)] }
	];

	it('simplifies by default: Cara pays Anna directly', () => {
		expect(settleTransfers(true, ['a', 'b', 'c'], entries)).toEqual([
			{ from: 'c', to: 'a', amountCents: 1500 }
		]);
	});

	it('pays back directly when simplifying is off', () => {
		expect(settleTransfers(false, ['a', 'b', 'c'], entries)).toHaveLength(2);
	});
});
