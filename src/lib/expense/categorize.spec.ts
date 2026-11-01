import { describe, expect, it } from 'vitest';
import { categorize } from './categorize';
import { buildDatasetIndex } from './dataset/index';
import dataset from './dataset/keywords.json';

describe('categorize', () => {
	it.each([
		['Lidl', 'groceries'],
		['Wocheneinkauf', 'groceries'],
		['Dinner at Luigi’s', 'dining'],
		['Frühstück', 'dining'],
		['Pizzaabend', 'dining'],
		['Beers at the pub', 'drinks'],
		['Taxi to the airport', 'transport'],
		['Tanken', 'fuel'],
		['Airbnb Lisbon', 'lodging'],
		['Rent October', 'rent'],
		['Strom', 'utilities'],
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

	it('tolerates one typo in longer keywords', () => {
		expect(categorize('Resturant')).toBe('dining');
		expect(categorize('Supermakt')).toBe('groceries');
		expect(categorize('Pizaa')).toBe('dining');
	});

	it('prefers an exact match over a typo match', () => {
		expect(categorize('Hostel, resturant')).toBe('lodging');
		expect(categorize('Taxi')).toBe('transport');
	});

	it('does not guess from short words with typos', () => {
		expect(categorize('Bat')).toBe('other');
	});

	it('uses the dataset after hand-written keywords', () => {
		const dataset = buildDatasetIndex({ groceries: ['netto marken discount'], lodging: ['rent'] });
		expect(categorize('Netto Marken-Discount', dataset)).toBe('groceries');
		expect(categorize('Rent', dataset)).toBe('rent');
	});
});

// Real-life titles for the categories that came with group types (#235), with the dataset
describe('titles of car and home costs', () => {
	const index = buildDatasetIndex(dataset.keywords);
	it.each([
		['Tanken', 'fuel'],
		['Jet Tankstelle', 'fuel'],
		['Shell', 'fuel'],
		['Aral', 'fuel'],
		['TotalEnergies', 'fuel'],
		['OMV', 'fuel'],
		['Agip', 'fuel'],
		['Super E10', 'fuel'],
		['Vollgetankt', 'fuel'],
		['Ladestrom', 'fuel'],
		['Ionity', 'fuel'],
		['Parkticket', 'parking'],
		['Parkgebühr', 'parking'],
		['Apcoa', 'parking'],
		['Brenner Maut', 'tolls'],
		['Asfinag', 'tolls'],
		['ATU', 'repairs'],
		['TÜV', 'repairs'],
		['Winterreifen', 'repairs'],
		['Waschanlage', 'repairs'],
		['Kfz Versicherung', 'insurance'],
		['HUK Coburg', 'insurance'],
		['Warmmiete', 'rent'],
		['Stadtwerke', 'utilities'],
		['Gasrechnung', 'utilities'],
		['Rundfunkbeitrag', 'utilities'],
		['Telekom', 'internet'],
		['Vodafone', 'internet'],
		['O2', 'internet'],
		['Glasfaser', 'internet'],
		['Mietwagen', 'transport'],
		['Rental car', 'transport'],
		['Parkett', 'home']
	])('%s is %s', (title, category) => {
		expect(categorize(title, index)).toBe(category);
	});
});
