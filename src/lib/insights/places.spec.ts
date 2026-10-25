import { describe, expect, it } from 'vitest';
import type { Kind } from './expense-kinds';
import { placesOf } from './places';

let next = 0;
const expense = (date: string, title: string, amountCents: number) => ({
	id: `e${next++}`,
	date,
	title,
	amountCents
});

describe('placesOf', () => {
	it('lists titles used again and again, most often first', () => {
		const rows = [
			...['01', '05', '09', '13'].map((day) => expense(`2026-08-${day}`, 'Café Lisa', 800)),
			...['02', '06', '10'].map((day) => expense(`2026-08-${day}`, 'rewe', 3000)),
			expense('2026-08-11', 'REWE', 2000),
			expense('2026-08-03', 'Kino', 2400)
		];
		expect(placesOf(rows, new Map())).toEqual([
			{ title: 'REWE', times: 4, amount: 11000 },
			{ title: 'Café Lisa', times: 4, amount: 3200 }
		]);
	});

	it('leaves out fixed costs', () => {
		const rows = ['06', '07', '08'].map((month) => expense(`2026-${month}-01`, 'Miete', 100000));
		const fixed = new Map(rows.map((row) => [row.id, 'fixed' as Kind]));
		expect(placesOf(rows, fixed)).toEqual([]);
	});
});
