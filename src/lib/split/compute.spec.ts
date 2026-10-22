import { describe, expect, it } from 'vitest';
import { computeShares, splitByWeight, splitProgress } from './compute';

const entries = (inputs: Record<string, number>) =>
	Object.entries(inputs).map(([memberId, input]) => ({ memberId, input }));
const shares = (result: ReturnType<typeof computeShares>) =>
	result.ok
		? Object.fromEntries(result.value.map((s) => [s.memberId, s.shareCents]))
		: result.error;

describe('splitByWeight', () => {
	it('always adds up, giving leftover cents to the largest remainders', () => {
		const result = splitByWeight(1000, entries({ a: 1, b: 1, c: 1 }));
		expect(result.map((s) => s.shareCents)).toEqual([334, 333, 333]);
	});

	it('handles large amounts exactly', () => {
		const result = splitByWeight(999_999_999_999, entries({ a: 3333, b: 6667 }));
		expect(result.reduce((sum, s) => sum + s.shareCents, 0)).toBe(999_999_999_999);
	});
});

describe('computeShares', () => {
	it('equal: between the chosen participants', () => {
		expect(shares(computeShares('equal', 1001, entries({ a: 0, b: 0 })))).toEqual({
			a: 501,
			b: 500
		});
	});

	it('exact: amounts must add up to the total', () => {
		expect(shares(computeShares('exact', 3000, entries({ a: 1000, b: 2000, c: 0 })))).toEqual({
			a: 1000,
			b: 2000
		});
		expect(shares(computeShares('exact', 3000, entries({ a: 1000 })))).toBe(
			'split_amounts_mismatch'
		);
	});

	it('percent: must add up to 100%', () => {
		expect(shares(computeShares('percent', 1000, entries({ a: 3333, b: 6667 })))).toEqual({
			a: 333,
			b: 667
		});
		expect(shares(computeShares('percent', 1000, entries({ a: 5000 })))).toBe(
			'split_percent_mismatch'
		);
	});

	it('shares: in proportion to the parts', () => {
		expect(shares(computeShares('shares', 3000, entries({ a: 200, b: 100, c: 0 })))).toEqual({
			a: 2000,
			b: 1000
		});
	});

	it('adjust: equal split of the rest, plus each difference', () => {
		expect(shares(computeShares('adjust', 3000, entries({ a: 600, b: 0, c: -300 })))).toEqual({
			a: 1500,
			b: 900,
			c: 600
		});
		expect(shares(computeShares('adjust', 1000, entries({ a: 2000, b: 0 })))).toBe(
			'split_adjust_too_large'
		);
	});

	it('needs someone to take part', () => {
		expect(shares(computeShares('shares', 1000, entries({ a: 0 })))).toBe('participants_required');
		expect(shares(computeShares('equal', 1000, []))).toBe('participants_required');
	});
});

describe('splitProgress', () => {
	it('reports how much is assigned', () => {
		expect(splitProgress('exact', 3000, entries({ a: 1000 }))).toEqual({
			assigned: 1000,
			target: 3000
		});
		expect(splitProgress('shares', 3000, entries({ a: 1 }))).toBeUndefined();
	});
});
