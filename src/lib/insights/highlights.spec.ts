import { describe, expect, it } from 'vitest';
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import type { Kind } from './expense-kinds';
import { highlightsOf } from './highlights';

let next = 0;
const expense = (
	date: string,
	title: string,
	amountCents: number,
	paidBy = 'anna',
	category: ExpenseCategory = 'dining'
) => ({ id: `e${next++}`, date, title, amountCents, paidBy, category });

const none = new Map<string, Kind>();
const kindsOf = (rows: { kind: string }[]) => rows.map((row) => row.kind);

describe('highlightsOf', () => {
	it('tells nothing about too little', () => {
		expect(highlightsOf([expense('2026-08-01', 'Pizza', 2000)], none, 2)).toEqual([]);
	});

	it('names a category that is most of everything', () => {
		const rows = [
			expense('2026-08-01', 'Hütte', 60000, 'anna', 'lodging'),
			expense('2026-08-01', 'Rewe', 20000, 'anna', 'groceries'),
			expense('2026-08-02', 'Fähre', 20000, 'anna', 'transport')
		];
		expect(highlightsOf(rows, none, 2)).toContainEqual({
			kind: 'topCategory',
			category: 'lodging',
			share: 0.6
		});
	});

	it("doesn't name the category the group is all about", () => {
		const rows = [
			expense('2026-08-01', 'Strom', 90000, 'anna', 'home'),
			expense('2026-08-02', 'Rewe', 10000, 'anna', 'groceries')
		];
		expect(kindsOf(highlightsOf(rows, none, 2))).not.toContain('topCategory');
	});

	it('finds the busiest day when it stands out', () => {
		const rows = [
			expense('2026-08-01', 'Café', 1000),
			expense('2026-08-02', 'Café', 1000),
			expense('2026-08-03', 'Fischsuppe', 9000),
			expense('2026-08-03', 'Bier', 1000)
		];
		expect(highlightsOf(rows, none, 2)).toContainEqual({
			kind: 'busiestDay',
			date: '2026-08-03',
			amount: 10000
		});
	});

	it('finds a favourite place, not a fixed cost', () => {
		const rows = [
			expense('2026-08-01', 'Rewe', 3000),
			expense('2026-08-08', 'rewe', 2000),
			expense('2026-08-15', 'REWE!', 4000),
			...['2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01'].map((date) =>
				expense(date, 'Miete', 100000)
			)
		];
		const fixed = new Map(
			rows.filter((row) => row.title === 'Miete').map((row) => [row.id, 'fixed' as Kind])
		);
		expect(highlightsOf(rows, fixed, 2)).toContainEqual({
			kind: 'place',
			title: 'REWE!',
			times: 3,
			amount: 9000
		});
	});

	it('names who pays most often, among several', () => {
		const rows = [
			expense('2026-08-01', 'A', 1000, 'ben'),
			expense('2026-08-05', 'B', 1000, 'ben'),
			expense('2026-08-09', 'C', 1000, 'ben'),
			expense('2026-08-13', 'D', 1000, 'anna')
		];
		expect(highlightsOf(rows, none, 2)).toContainEqual({
			kind: 'mostOften',
			memberId: 'ben',
			times: 3,
			count: 4
		});
		expect(kindsOf(highlightsOf(rows, none, 1))).not.toContain('mostOften');
		// Between two, three of four is a lot; three of five is about fair
		const fairer = [...rows, expense('2026-08-17', 'E', 1000, 'anna')];
		expect(kindsOf(highlightsOf(fairer, none, 2))).not.toContain('mostOften');
	});

	it('counts the longest streak of days with expenses', () => {
		const rows = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-10'].map(
			(date) => expense(date, date, 1000)
		);
		expect(highlightsOf(rows, none, 2)).toContainEqual({
			kind: 'streak',
			days: 4,
			from: '2026-08-01'
		});
		// Every day of it isn't a streak worth telling
		expect(kindsOf(highlightsOf(rows.slice(0, 4), none, 2))).not.toContain('streak');
	});

	it('finds the weekday most is spent on, over a few weeks', () => {
		// Saturdays: 2026-08-01, 08, 15, 22
		const rows = [
			...['2026-08-01', '2026-08-08', '2026-08-15', '2026-08-22'].map((date) =>
				expense(date, 'Bar', 5000)
			),
			...['2026-08-04', '2026-08-11', '2026-08-18', '2026-08-25'].map((date) =>
				expense(date, 'Kino', 1000)
			)
		];
		expect(highlightsOf(rows, none, 2)).toContainEqual(
			expect.objectContaining({ kind: 'weekday', weekday: 5 })
		);
	});

	it('tells at most four, most telling first', () => {
		const rows = [
			...['2026-08-01', '2026-08-02', '2026-08-03'].map((date) =>
				expense(date, 'Rewe', 2000, 'ben', 'groceries')
			),
			expense('2026-08-03', 'Hütte', 15000, 'ben', 'lodging')
		];
		const highlights = highlightsOf(rows, none, 3);
		expect(highlights.length).toBeLessThanOrEqual(4);
		expect(highlights[0].kind).toBe('topCategory');
	});
});
