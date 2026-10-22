import { describe, expect, it } from 'vitest';
import { buildTypoIndex, findWithTypo } from './typo-index';

const index = buildTypoIndex(['restaurant', 'pizza', 'hostel', 'hotel']);

describe('findWithTypo', () => {
	it.each([
		['restaurant', ['restaurant']],
		['restaurent', ['restaurant']], // changed
		['resturant', ['restaurant']], // missing
		['restaaurant', ['restaurant']], // extra
		['restuarant', ['restaurant']], // swapped
		['hostel', ['hostel', 'hotel']],
		['pasta', []],
		['x', []]
	])('%s → %j', (text, expected) => {
		expect(findWithTypo(index, text).sort()).toEqual(expected);
	});
});
