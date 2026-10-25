import { describe, expect, it } from 'vitest';
import { budgetOf } from './budget';

const expense = (date: string, amountCents: number) => ({ date, amountCents });

/** A week in Norway, three days in: 300 € a day */
const trip = [
	expense('2026-07-01', 30000),
	expense('2026-07-02', 20000),
	expense('2026-07-03', 40000)
];

describe('budgetOf', () => {
	it('is nothing without a budget or an end date', () => {
		expect(budgetOf(trip, { budget: null, endsOn: null }, '2026-07-03')).toBeNull();
	});

	it('adds up what was spent, day by day', () => {
		const view = budgetOf(trip, { budget: 200000, endsOn: null }, '2026-07-03')!;
		expect(view.spent).toBe(90000);
		expect(view.points).toEqual([
			{ date: '2026-07-01', spent: 30000 },
			{ date: '2026-07-02', spent: 50000 },
			{ date: '2026-07-03', spent: 90000 }
		]);
		expect(view.projected).toBeNull();
		expect(view.leftPerDay).toBeNull();
	});

	it('projects the pace so far to the end date', () => {
		const view = budgetOf(trip, { budget: 200000, endsOn: '2026-07-07' }, '2026-07-03')!;
		// 300 € a day for four more days
		expect(view.projected).toBe(210000);
		// Today and the four days after it
		expect(view.daysLeft).toBe(5);
		expect(view.leftPerDay).toBe(22000);
	});

	it('counts quiet days since the last expense in the pace', () => {
		const view = budgetOf(trip, { budget: null, endsOn: '2026-07-10' }, '2026-07-05')!;
		// 900 € over five days is 180 € a day, for five more days
		expect(view.projected).toBe(180000);
	});

	it('has nothing left per day once the budget is used up', () => {
		const view = budgetOf(trip, { budget: 80000, endsOn: '2026-07-07' }, '2026-07-03')!;
		expect(view.leftPerDay).toBe(0);
	});

	it('stops projecting once the end date is past', () => {
		const view = budgetOf(trip, { budget: 200000, endsOn: '2026-07-03' }, '2026-07-09')!;
		expect(view.projected).toBeNull();
		expect(view.daysLeft).toBeNull();
		expect(view.leftPerDay).toBeNull();
		expect(view.upTo).toBe('2026-07-03');
	});

	it('counts expenses booked ahead as spent by then', () => {
		const booked = [expense('2026-06-01', 50000), expense('2026-07-05', 10000)];
		const view = budgetOf(booked, { budget: null, endsOn: '2026-07-10' }, '2026-06-10')!;
		expect(view.spent).toBe(60000);
		expect(view.projected).toBeGreaterThan(60000);
	});
});
