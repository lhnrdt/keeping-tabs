import { describe, expect, it } from 'vitest';
import { bucketStart, insightsOf, MAX_CATEGORIES, unitFor, type InsightEntry } from './insights';

const MEMBERS = ['anna', 'ben'];

/** An expense paid by `paidBy`, split equally between Anna and Ben */
function expense(
	date: string,
	amountCents: number,
	category: InsightEntry['category'] = 'dining',
	paidBy = 'anna'
): InsightEntry {
	const half = amountCents / 2;
	return {
		id: `${date}-${amountCents}-${category}`,
		type: 'expense',
		title: category,
		amountCents,
		paidBy,
		date,
		category,
		splits: [
			{ memberId: 'anna', shareCents: half },
			{ memberId: 'ben', shareCents: half }
		]
	};
}

describe('insightsOf', () => {
	it('sums expenses only, per person, per day and as your share', () => {
		const payment: InsightEntry = {
			...expense('2026-08-05', 9999),
			type: 'payment',
			splits: [{ memberId: 'ben', shareCents: 9999 }]
		};
		const result = insightsOf(
			[expense('2026-08-01', 3000), expense('2026-08-03', 1500), payment],
			MEMBERS,
			'ben'
		);
		expect(result).toMatchObject({
			total: 4500,
			count: 2,
			perPerson: 2250,
			myShare: 2250,
			perDay: 1500,
			first: '2026-08-01',
			last: '2026-08-03',
			days: 3
		});
	});

	it('tells what each member paid, their share and how often they paid', () => {
		const { byMember } = insightsOf(
			[
				expense('2026-08-01', 3000),
				expense('2026-08-02', 1000, 'dining', 'ben'),
				expense('2026-08-03', 2000)
			],
			MEMBERS,
			null
		);
		expect(byMember).toEqual([
			{ memberId: 'anna', paid: 5000, share: 3000, times: 2 },
			{ memberId: 'ben', paid: 1000, share: 3000, times: 1 }
		]);
	});

	it('fills empty days so the chart shows the gaps, without a change for days', () => {
		const { overTime, change } = insightsOf(
			[expense('2026-08-01', 100), expense('2026-08-03', 200)],
			MEMBERS,
			null
		);
		expect(overTime.unit).toBe('day');
		expect(overTime.buckets).toEqual([
			{ start: '2026-08-01', amount: 100 },
			{ start: '2026-08-02', amount: 0 },
			{ start: '2026-08-03', amount: 200 }
		]);
		expect(change).toBeNull();
	});

	it('groups by month for a long span, comparing the last two months', () => {
		const { overTime, change } = insightsOf(
			[expense('2026-01-15', 100), expense('2026-08-02', 300), expense('2026-09-02', 200)],
			MEMBERS,
			null
		);
		expect(overTime.unit).toBe('month');
		expect(overTime.buckets).toHaveLength(9);
		expect(change).toEqual({ current: 200, previous: 300 });
	});

	it('orders categories by amount and folds the small ones into the rest', () => {
		const categories = [
			'dining',
			'groceries',
			'transport',
			'lodging',
			'fun',
			'drinks',
			'gifts'
		] as const;
		const entries = categories.map((category, i) =>
			expense('2026-08-01', 1000 - i * 100, category)
		);
		const { byCategory, total } = insightsOf(entries, MEMBERS, null);
		expect(byCategory).toHaveLength(MAX_CATEGORIES);
		expect(byCategory[0]).toMatchObject({ category: 'dining', amount: 1000 });
		expect(byCategory.at(-1)).toMatchObject({ category: 'rest', amount: 500 + 400 });
		expect(byCategory.reduce((sum, row) => sum + row.amount, 0)).toBe(total);
	});

	it('lists the biggest expenses, largest first', () => {
		const { biggest } = insightsOf(
			[100, 900, 300, 700, 500, 200].map((amount, i) => expense(`2026-08-0${i + 1}`, amount)),
			MEMBERS,
			null
		);
		expect(biggest.map(({ amount }) => amount)).toEqual([900, 700, 500, 300, 200]);
	});

	it('leaves monthly rent out of the biggest expenses, and sums up the kinds (#167)', () => {
		const rent = ['2026-05', '2026-06', '2026-07'].map((month) => ({
			...expense(`${month}-01`, 150000),
			title: 'Miete'
		}));
		const result = insightsOf(
			[...rent, expense('2026-06-12', 4000), expense('2026-06-20', 90000)],
			MEMBERS,
			null
		);
		expect(result.biggest.map(({ amount }) => amount)).toEqual([90000, 4000]);
		expect(result.fixed.map(({ title }) => title)).toEqual(['Miete']);
		expect(result.fixedPerMonth).toBe(150000);
		expect(result.byKind.find(({ kind }) => kind === 'fixed')?.amount).toBe(450000);
	});

	it('has nothing to show without expenses', () => {
		expect(insightsOf([], MEMBERS, 'anna')).toMatchObject({
			total: 0,
			count: 0,
			first: null,
			days: 0,
			byCategory: [],
			biggest: []
		});
	});
});

describe('units and buckets', () => {
	it('picks days, weeks or months by the span', () => {
		expect(unitFor(12)).toBe('day');
		expect(unitFor(90)).toBe('week');
		expect(unitFor(180)).toBe('month');
		expect(unitFor(400)).toBe('month');
	});

	it('starts weeks on Monday', () => {
		expect(bucketStart('2026-10-25', 'week')).toBe('2026-10-19'); // a Sunday
		expect(bucketStart('2026-10-19', 'week')).toBe('2026-10-19');
	});
});
