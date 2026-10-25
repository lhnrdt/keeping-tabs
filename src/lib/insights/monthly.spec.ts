import { describe, expect, it } from 'vitest';
import { categoriesByMonth, seriesCategories } from './monthly';

const expense = (
	date: string,
	amountCents: number,
	category: Parameters<typeof categoriesByMonth>[0][number]['category']
) => ({ date, amountCents, category });

describe('seriesCategories', () => {
	it('takes the five largest, in the fixed category order', () => {
		const rows = (['fun', 'dining', 'groceries', 'home', 'transport', 'gifts'] as const).map(
			(category, i) => ({ category, amount: 600 - i * 100, share: 0 })
		);
		expect(seriesCategories(rows)).toEqual(['groceries', 'dining', 'transport', 'home', 'fun']);
	});

	it('never counts the rest as a category', () => {
		expect(
			seriesCategories([
				{ category: 'dining', amount: 10, share: 0.5 },
				{ category: 'rest', amount: 10, share: 0.5 }
			])
		).toEqual(['dining']);
	});
});

describe('categoriesByMonth', () => {
	const series = ['groceries', 'dining'] as const;

	it('sums each month by category, the others as the rest', () => {
		const months = categoriesByMonth(
			[
				expense('2026-08-02', 3000, 'groceries'),
				expense('2026-08-20', 2000, 'dining'),
				expense('2026-08-21', 500, 'gifts'),
				expense('2026-08-25', 1000, 'groceries')
			],
			series
		);
		expect(months).toEqual([
			{
				month: '2026-08-01',
				total: 6500,
				slices: [
					{ category: 'groceries', amount: 4000 },
					{ category: 'dining', amount: 2000 },
					{ category: 'rest', amount: 500 }
				]
			}
		]);
	});

	it('keeps empty months in between', () => {
		const months = categoriesByMonth(
			[expense('2026-06-10', 1000, 'dining'), expense('2026-08-10', 1000, 'dining')],
			series
		);
		expect(months.map(({ month, total }) => [month, total])).toEqual([
			['2026-06-01', 1000],
			['2026-07-01', 0],
			['2026-08-01', 1000]
		]);
	});
});
