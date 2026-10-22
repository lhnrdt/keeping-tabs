import { describe, expect, it } from 'vitest';
import { TINTS, tintClass, tintFor } from './tints';

describe('tintFor', () => {
	it('is stable for the same id', () => {
		expect(tintFor('a5c0e1f2-1234')).toBe(tintFor('a5c0e1f2-1234'));
	});

	it('spreads ids over all tints', () => {
		const used = new Set(Array.from({ length: 50 }, (_, i) => tintFor(crypto.randomUUID() + i)));
		expect(used.size).toBe(TINTS.length);
	});

	it('names the utility class', () => {
		expect(tintClass('x')).toMatch(/^tint-(sage|clay|sand|moss|sky)$/);
	});
});

describe('tintClass with a chosen tint', () => {
	it('uses the chosen tint over the derived one', () => {
		expect(tintClass('x', 'clay')).toBe('tint-clay');
		expect(tintClass('x', null)).toBe(tintClass('x'));
	});
});
