import { describe, expect, it } from 'vitest';
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import { fixedCosts, fixedCostsWithin, kindsOf } from './expense-kinds';

let next = 0;
const expense = (date: string, category: ExpenseCategory, amountCents: number) => ({
	id: `e${next++}`,
	date,
	category,
	amountCents
});

/** Six months of a shared flat: rent, electricity, groceries written every which way, one sofa */
function flat() {
	const rows = [];
	for (const [i, month] of ['05', '06', '07', '08', '09', '10'].entries()) {
		rows.push(expense(`2026-${month}-01`, 'rent', 165000));
		rows.push(expense(`2026-${month}-03`, 'utilities', 7800 + i * 240));
		rows.push(expense(`2026-${month}-10`, 'groceries', 4200));
		rows.push(expense(`2026-${month}-18`, 'groceries', 3100));
		rows.push(expense(`2026-${month}-22`, 'dining', [9000, 5400, 12500, 6800, 11000, 4800][i]));
	}
	rows.push(expense('2026-07-14', 'home', 84900));
	return rows;
}

describe('kindsOf (#167)', () => {
	const rows = flat();
	const kinds = kindsOf(rows);
	const kindOf = (category: ExpenseCategory) =>
		kinds.get(rows.find((row) => row.category === category)!.id);

	it('counts what’s fixed by nature as fixed, whatever each one was called', () => {
		expect(kindOf('rent')).toBe('fixed');
		expect(kindOf('utilities')).toBe('fixed');
	});

	it('counts frequent small costs as everyday, and a rare big one as a one-off', () => {
		expect(kindOf('groceries')).toBe('everyday');
		expect(kindOf('home')).toBe('big');
	});

	it('doesn’t let rent make everything else look small', () => {
		// Next to rent alone, the sofa would be nothing special
		expect(kindOf('home')).not.toBe('everyday');
	});
});

describe('fixedCosts (#167)', () => {
	const costs = fixedCosts(flat());

	it('is one row per fixed category, largest first, with its months', () => {
		expect(costs.map((cost) => cost.category)).toEqual(['rent', 'utilities']);
		expect(costs[0].months).toHaveLength(6);
		expect(costs[0].average).toBe(165000);
	});

	it('spreads a cost paid every few months over the months until the next', () => {
		const [twice] = fixedCosts([
			expense('2026-01-10', 'insurance', 30000),
			expense('2026-07-10', 'insurance', 30000)
		]);
		expect(twice.everyMonths).toBe(6);
		// €600 over January to December
		expect(twice.average).toBe(5000);
		// Paid once: insurance usually covers a year
		const [once] = fixedCosts([expense('2026-01-10', 'insurance', 30000)]);
		expect(once.everyMonths).toBe(12);
		expect(once.average).toBe(2500);
		// Monthly ones stay as they were
		expect(costs[0].everyMonths).toBe(1);
	});

	it('compares the latest month with the one before', () => {
		expect(costs[1].latest).toBe(7800 + 5 * 240);
		expect(costs[1].previous).toBe(7800 + 4 * 240);
	});

	it('adds up a month with several bills of the same kind', () => {
		const [cost] = fixedCosts([
			expense('2026-05-02', 'utilities', 5000),
			expense('2026-05-20', 'utilities', 3000)
		]);
		expect(cost.months).toEqual([{ month: '2026-05', amount: 8000 }]);
	});

	it('shows a period’s months, and only costs that occur in it', () => {
		const within = fixedCostsWithin(costs, { from: '2026-09-01', to: '2026-10-31' });
		expect(within[0].months.map(({ month }) => month)).toEqual(['2026-09', '2026-10']);
		expect(fixedCostsWithin(costs, { from: '2025-01-01', to: '2025-12-31' })).toEqual([]);
	});
});
