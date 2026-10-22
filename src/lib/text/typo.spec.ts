import { describe, expect, it } from 'vitest';
import { withinOneEdit } from './typo';

describe('withinOneEdit', () => {
	it.each([
		['restaurant', 'restaurant'],
		['restaurent', 'restaurant'],
		['resturant', 'restaurant'],
		['restaaurant', 'restaurant'],
		['restuarant', 'restaurant'],
		['piza', 'pizza']
	])('%s ≈ %s', (a, b) => {
		expect(withinOneEdit(a, b)).toBe(true);
	});

	it.each([
		['resturnt', 'restaurant'],
		['pasta', 'pizza'],
		['hotel', 'hostel2']
	])('%s ≠ %s', (a, b) => {
		expect(withinOneEdit(a, b)).toBe(false);
	});
});
