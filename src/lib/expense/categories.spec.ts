import { describe, expect, it } from 'vitest';
import { categoriesFor, EXPENSE_CATEGORIES } from './categories';

describe('categoriesFor', () => {
	it('offers what fits the kind of group, with Other last', () => {
		const car = categoriesFor('car');
		expect(car.slice(0, 2)).toEqual(['fuel', 'parking']);
		expect(car).not.toContain('groceries');
		expect(car.at(-1)).toBe('other');
	});

	it('keeps the one in use, even when it does not fit', () => {
		const car = categoriesFor('car', { shown: 'groceries' });
		expect(car).toContain('groceries');
		expect(car.at(-1)).toBe('other');
		expect(categoriesFor('car', { shown: 'fuel' })).toEqual(categoriesFor('car'));
	});

	it('offers everything on request', () => {
		expect(categoriesFor('food', { all: true })).toHaveLength(EXPENSE_CATEGORIES.length);
	});
});
