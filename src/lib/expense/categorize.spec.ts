import { describe, expect, it } from 'vitest';
import { categorize } from './categorize';

describe('categorize', () => {
	it.each([
		['Lidl', 'groceries'],
		['Wocheneinkauf', 'groceries'],
		['Dinner at Luigi’s', 'dining'],
		['Frühstück', 'dining'],
		['Pizzaabend', 'dining'],
		['Beers at the pub', 'drinks'],
		['Taxi to the airport', 'transport'],
		['Tanken', 'transport'],
		['Airbnb Lisbon', 'lodging'],
		['Rent October', 'home'],
		['Strom', 'home'],
		['Cinema tickets', 'fun'],
		['Birthday present for Cara', 'gifts'],
		['Apotheke', 'health'],
		['Something else', 'other']
	] as const)('%s → %s', (title, category) => {
		expect(categorize(title)).toBe(category);
	});

	it('only matches short keywords as whole words', () => {
		expect(categorize('Barbecue coal')).toBe('other');
		expect(categorize('Business lunch')).toBe('dining');
	});

	it('prefers the earlier category when several match', () => {
		expect(categorize('Hotel breakfast')).toBe('lodging');
	});
});
