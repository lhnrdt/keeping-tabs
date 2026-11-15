import { describe, expect, it } from 'vitest';
import { centOrder, inOrder } from './cent-order';

describe('centOrder', () => {
	it('puts whoever owes the least first', () => {
		expect(centOrder(['anna', 'ben', 'cara'], { anna: -500, ben: 300, cara: 0 })).toEqual([
			'ben',
			'cara',
			'anna'
		]);
	});

	it('keeps the group order for equal balances and without any', () => {
		expect(centOrder(['anna', 'ben'], { anna: 0, ben: 0 })).toEqual(['anna', 'ben']);
		expect(centOrder(['anna', 'ben'], undefined)).toEqual(['anna', 'ben']);
		expect(centOrder(['anna', 'ben'], { ben: 1 })).toEqual(['ben', 'anna']);
	});
});

describe('inOrder', () => {
	it('sorts by the order, the rest after as they were', () => {
		expect(inOrder(['anna', 'ben', 'cara'], ['cara', 'anna'])).toEqual(['cara', 'anna', 'ben']);
		expect(inOrder(['anna', 'ben'], undefined)).toEqual(['anna', 'ben']);
	});
});
