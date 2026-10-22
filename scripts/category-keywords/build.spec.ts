import { describe, expect, it } from 'vitest';
import { buildKeywords, type Options } from './build';

const options: Options = {
	placeTypes: [
		['shop/supermarket', 'groceries'],
		['amenity/bar', 'drinks']
	],
	regions: ['001', 'de'],
	minLetters: 4,
	ignored: ['shop']
};

const nsi = {
	'brands/shop/supermarket': {
		items: [
			{ displayName: 'Lidl', matchNames: ['Lidl Markt'], locationSet: { include: ['001'] } },
			{ displayName: 'Kroger', locationSet: { include: ['us'] } },
			{ displayName: 'Bärs', locationSet: { include: ['DE'] } },
			{ displayName: '365', locationSet: { include: ['de'] } },
			{ displayName: 'Ашан', locationSet: { include: ['de'] } }
		]
	},
	'brands/amenity/bar': { items: [{ displayName: 'Lidl', locationSet: { include: ['de'] } }] }
};

const presets = [
	{ 'shop/supermarket': { name: 'Supermarket', terms: ['shop', 'grocery'] } },
	{
		'shop/supermarket': { name: 'Supermarkt', terms: ['Lebensmittel'] },
		'amenity/bar': { name: 'Bar' }
	}
];

describe('buildKeywords', () => {
	const keywords = buildKeywords(nsi, presets, options);

	it('collects normalized terms and brands of the chosen regions, sorted', () => {
		expect(keywords.groceries).toEqual([
			'bars',
			'grocery',
			'lebensmittel',
			'lidl',
			'supermarket',
			'supermarkt'
		]);
	});

	it('keeps a name in the first category that claims it', () => {
		expect(keywords.drinks).toEqual([]);
	});

	it('skips names with few letters, other scripts and phrases a shorter keyword covers', () => {
		const all = Object.values(keywords).flat();
		expect(all).not.toContain('365');
		expect(all).not.toContain('ашан');
		expect(all).not.toContain('lidl markt');
	});
});
