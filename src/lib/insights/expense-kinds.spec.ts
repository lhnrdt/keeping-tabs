import { describe, expect, it } from 'vitest';
import { fixedCosts, kindsOf } from './expense-kinds';

let next = 0;
const expense = (date: string, title: string, amountCents: number) => ({
	id: `e${next++}`,
	date,
	title,
	amountCents
});

/** Six months of a shared flat: rent, electricity, groceries, and one sofa */
function flat() {
	const rows = [];
	for (const [i, month] of ['05', '06', '07', '08', '09', '10'].entries()) {
		rows.push(expense(`2026-${month}-01`, 'Miete', 165000));
		rows.push(expense(`2026-${month}-03`, 'Strom', 7800 + i * 240));
		rows.push(expense(`2026-${month}-10`, 'Rewe', 4200));
		rows.push(expense(`2026-${month}-18`, 'Rewe', 3100));
		// Pizza nights: monthly, but the bill depends on who's there
		rows.push(
			expense(`2026-${month}-22`, 'Pizza-Abend', [9000, 5400, 12500, 6800, 11000, 4800][i])
		);
	}
	rows.push(expense('2026-07-14', 'Neues Sofa', 84900));
	return rows;
}

describe('kindsOf', () => {
	const rows = flat();
	const kinds = kindsOf(rows);
	const kindOf = (title: string) => kinds.get(rows.find((row) => row.title === title)!.id);

	it('finds monthly costs at a steady amount', () => {
		expect(kindOf('Miete')).toBe('fixed');
		expect(kindOf('Strom')).toBe('fixed');
	});

	it("doesn't count frequent shopping as fixed, however regular", () => {
		expect(kindOf('Rewe')).toBe('everyday');
	});

	it('tells big one-offs and occasional costs apart', () => {
		expect(kindOf('Neues Sofa')).toBe('big');
		expect(kindOf('Pizza-Abend')).toBe('everyday');
	});

	it('needs three months before something counts as fixed', () => {
		const short = [expense('2026-05-01', 'Miete', 165000), expense('2026-06-01', 'Miete', 165000)];
		expect([...kindsOf(short).values()]).not.toContain('fixed');
	});
});

describe('fixedCosts', () => {
	it('lists recurring costs, largest first, with their trend', () => {
		const [rent, power] = fixedCosts(flat());
		expect(rent).toMatchObject({
			title: 'Miete',
			average: 165000,
			latest: 165000,
			previous: 165000
		});
		expect(power).toMatchObject({
			title: 'Strom',
			latest: 7800 + 5 * 240,
			previous: 7800 + 4 * 240
		});
		expect(power.months.map(({ month }) => month)).toEqual([
			'2026-05',
			'2026-06',
			'2026-07',
			'2026-08',
			'2026-09',
			'2026-10'
		]);
	});

	it('shows a month without it as zero', () => {
		const rows = ['2026-01', '2026-02', '2026-04', '2026-05'].map((month) =>
			expense(`${month}-01`, 'Netflix', 1399)
		);
		expect(fixedCosts(rows)[0].months.find(({ month }) => month === '2026-03')).toEqual({
			month: '2026-03',
			amount: 0
		});
	});
});
