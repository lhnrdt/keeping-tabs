import { describe, expect, it } from 'vitest';
import type { Kind } from './expense-kinds';
import { kindsByMonth } from './kind-months';

const expense = (id: string, date: string, amountCents: number) => ({ id, date, amountCents });
const kinds = new Map<string, Kind>([
	['rent-8', 'fixed'],
	['rent-10', 'fixed'],
	['shop', 'everyday'],
	['sofa', 'big']
]);

describe('kindsByMonth', () => {
	it('stacks each month by kind, empty months included', () => {
		expect(
			kindsByMonth(
				[
					expense('rent-8', '2026-08-01', 100000),
					expense('shop', '2026-08-12', 4000),
					expense('rent-10', '2026-10-01', 100000),
					expense('sofa', '2026-10-20', 60000)
				],
				kinds
			)
		).toEqual([
			{ month: '2026-08-01', fixed: 100000, everyday: 4000, occasional: 0, big: 0 },
			{ month: '2026-09-01', fixed: 0, everyday: 0, occasional: 0, big: 0 },
			{ month: '2026-10-01', fixed: 100000, everyday: 0, occasional: 0, big: 60000 }
		]);
	});

	it('covers a whole year when one is chosen', () => {
		const months = kindsByMonth([expense('shop', '2026-08-12', 4000)], kinds, {
			from: '2026-01-01',
			to: '2026-12-31'
		});
		expect(months).toHaveLength(12);
	});
});
