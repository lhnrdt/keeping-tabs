import { describe, expect, it } from 'vitest';
import { balances } from '#lib/money.ts';
import { isPaidByEach, payersFromShares } from './paid-by-each';

const shares = [
	{ memberId: 'a', shareCents: 300 },
	{ memberId: 'b', shareCents: 500 },
	{ memberId: 'c', shareCents: 0 }
];

describe('an expense everyone already paid their share of', () => {
	it('has each one with a share as a payer of it, the biggest first', () => {
		expect(payersFromShares(shares)).toEqual([
			{ memberId: 'b', amountCents: 500 },
			{ memberId: 'a', amountCents: 300 }
		]);
	});

	it('leaves everyone’s balance as it was', () => {
		const payers = payersFromShares(shares);
		const entry = { paidBy: 'b', amountCents: 800, payers, splits: shares };
		expect([...balances(['a', 'b', 'c'], [entry]).values()]).toEqual([0, 0, 0]);
	});

	it('is told apart from several people paying different parts', () => {
		expect(isPaidByEach({ payers: payersFromShares(shares), splits: shares })).toBe(true);
		const other = [
			{ memberId: 'a', amountCents: 800 },
			{ memberId: 'b', amountCents: 0 }
		];
		expect(isPaidByEach({ payers: other, splits: shares })).toBe(false);
		expect(isPaidByEach({ payers: null, splits: shares })).toBe(false);
	});
});
