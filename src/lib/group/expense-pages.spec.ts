import { describe, expect, it } from 'vitest';
import { shownCount } from './expense-pages';

describe('shownCount', () => {
	it.each([
		[null, 50],
		['abc', 50],
		['-5', 50],
		['100', 100],
		['120', 150]
	])('?show=%s → %i', (param, count) => {
		expect(shownCount(param)).toBe(count);
	});
});
