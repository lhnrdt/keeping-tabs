import { describe, expect, it } from 'vitest';
import { seriesCategories, slicesOf } from './category-slices';

const expense = (
	amountCents: number,
	category: Parameters<typeof slicesOf>[0][number]['category']
) => ({
	amountCents,
	category
});

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

describe('slicesOf', () => {
	it('sums by category in the series order, the others as the rest', () => {
		expect(
			slicesOf(
				[
					expense(1000, 'dining'),
					expense(3000, 'groceries'),
					expense(500, 'gifts'),
					expense(1000, 'groceries')
				],
				['groceries', 'dining']
			)
		).toEqual([
			{ category: 'groceries', amount: 4000 },
			{ category: 'dining', amount: 1000 },
			{ category: 'rest', amount: 500 }
		]);
	});

	it('leaves out what wasn’t spent on', () => {
		expect(slicesOf([expense(1000, 'dining')], ['groceries', 'dining'])).toEqual([
			{ category: 'dining', amount: 1000 }
		]);
	});
});
