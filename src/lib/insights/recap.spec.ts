import { describe, expect, it } from 'vitest';
import { insightsOf, type InsightEntry } from './insights';
import { isFinished, recapOf } from './recap';

let next = 0;
const expense = (
	date: string,
	amountCents: number,
	category: InsightEntry['category'] = 'dining'
): InsightEntry => ({
	id: `e${next++}`,
	type: 'expense',
	title: `Expense ${next}`,
	amountCents,
	paidBy: 'anna',
	date,
	category,
	splits: [
		{ memberId: 'anna', shareCents: amountCents / 2 },
		{ memberId: 'ben', shareCents: amountCents / 2 }
	]
});

const trip = insightsOf(
	[
		expense('2026-08-01', 60000, 'lodging'),
		expense('2026-08-02', 8000),
		expense('2026-08-03', 4000),
		expense('2026-08-05', 8000)
	],
	['anna', 'ben'],
	'anna'
);

describe('isFinished', () => {
	it('is over after its end date', () => {
		expect(isFinished('2026-08-05', '2026-08-06', '2026-08-06')).toBe(false);
		expect(isFinished('2026-08-05', '2026-08-06', '2026-08-07')).toBe(true);
	});

	it('without one, after two quiet weeks', () => {
		expect(isFinished('2026-08-05', null, '2026-08-18')).toBe(false);
		expect(isFinished('2026-08-05', null, '2026-08-19')).toBe(true);
	});
});

describe('recapOf', () => {
	it('is nothing while the group is still going', () => {
		expect(recapOf(trip, null, '2026-08-06')).toBeNull();
	});

	it('sums up a finished trip', () => {
		expect(recapOf(trip, '2026-08-05', '2026-08-20')).toEqual({
			from: '2026-08-01',
			to: '2026-08-05',
			days: 5,
			total: 80000,
			count: 4,
			perPerson: 40000,
			perDay: 16000,
			people: 2,
			topCategory: { category: 'lodging', share: 0.75 },
			busiestDay: { date: '2026-08-01', amount: 60000 }
		});
	});
});
