import { describe, expect, it } from 'vitest';
import { fromSplitwiseCategory } from './splitwise-categories';

describe('fromSplitwiseCategory', () => {
	it.each([
		['Lebensmittel', 'groceries'],
		['Haushaltsgegenstände', 'home'],
		['Dining out', 'dining'],
		['Allgemein', null],
		[' ', null]
	] as const)('%s → %s', (category, ours) => {
		expect(fromSplitwiseCategory(category)).toBe(ours);
	});
});
