import { describe, expect, it } from 'vitest';
import { spendingAcross, type SpendingGroup } from './across';
import type { InsightEntry } from './insights';

let next = 0;
const expense = (
	date: string,
	amountCents: number,
	shares: Record<string, number>,
	category: InsightEntry['category'] = 'dining'
): InsightEntry => ({
	id: `e${next++}`,
	type: 'expense',
	title: 'Expense',
	amountCents,
	paidBy: Object.keys(shares)[0],
	date,
	category,
	splits: Object.entries(shares).map(([memberId, shareCents]) => ({ memberId, shareCents }))
});

const group = (
	id: string,
	currency: string,
	members: SpendingGroup['members'],
	entries: InsightEntry[]
): SpendingGroup => ({
	id,
	name: id,
	token: `t-${id}`,
	currency,
	kind: 'other',
	tint: 'sage',
	memberId: members[0].id,
	members,
	entries
});

const flat = group(
	'flat',
	'EUR',
	[
		{ id: 'f-anna', name: 'Anna', personId: 'anna' },
		{ id: 'f-ben', name: 'Ben', personId: 'ben' }
	],
	[
		expense('2026-08-03', 10000, { 'f-anna': 5000, 'f-ben': 5000 }, 'groceries'),
		expense('2026-09-03', 4000, { 'f-ben': 4000 }, 'groceries')
	]
);
const trip = group(
	'trip',
	'EUR',
	[
		{ id: 't-anna', name: 'Anna', personId: 'anna' },
		{ id: 't-ben', name: 'Ben', personId: 'ben' },
		{ id: 't-cara', name: 'Cara', personId: null }
	],
	[expense('2026-09-10', 30000, { 't-anna': 10000, 't-ben': 10000, 't-cara': 10000 }, 'lodging')]
);
const usa = group(
	'usa',
	'USD',
	[{ id: 'u-anna', name: 'Anna', personId: 'anna' }],
	[expense('2026-09-12', 2000, { 'u-anna': 2000 })]
);

describe('spendingAcross', () => {
	it('is nothing without a share of anything', () => {
		expect(spendingAcross([])).toBeNull();
	});

	it('adds up your share, in the currency you spend most in', () => {
		const spending = spendingAcross([flat, trip, usa])!;
		expect(spending.currency).toBe('EUR');
		expect(spending.total).toBe(15000);
		expect(spending.otherCurrencies).toEqual(['USD']);
		expect(spending.months).toEqual([
			{ start: '2026-08-01', amount: 5000 },
			{ start: '2026-09-01', amount: 10000 }
		]);
		expect(spending.byCategory.map(({ category, amount }) => [category, amount])).toEqual([
			['lodging', 10000],
			['groceries', 5000]
		]);
		expect(spending.byGroup.map(({ id, amount }) => [id, amount])).toEqual([
			['trip', 10000],
			['flat', 5000]
		]);
	});

	it('finds who you share the most with, the same person across groups', () => {
		const [ben, cara] = spendingAcross([flat, trip])!.sharedWith;
		expect(ben).toMatchObject({ key: 'person:ben', name: 'Ben', amount: 15000 });
		expect(cara).toMatchObject({ key: 'member:t-cara', name: 'Cara', amount: 10000 });
	});
});
