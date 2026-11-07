import { describe, expect, it } from 'vitest';
import { keptEqualShares } from './kept-cents';

const share = (memberId: string, shareCents: number) => ({ memberId, shareCents, input: 0 });
// As Splitwise had it: the odd cent with b, where our split gives it to a
const imported = {
	splitMode: 'equal',
	amountCents: 1001,
	splits: [share('a', 500), share('b', 501)]
};
const edited = (amountCents = 1001, shares = [share('a', 501), share('b', 500)]) => ({
	splitMode: 'equal',
	amountCents,
	shares
});

describe('an edited equal split', () => {
	it('keeps its odd cent where it was, when the split stays the same', () => {
		expect(keptEqualShares(edited(), imported).shares).toEqual([share('a', 500), share('b', 501)]);
	});

	it('is split again when the amount changes', () => {
		const input = edited(1003, [share('a', 502), share('b', 501)]);
		expect(keptEqualShares(input, imported)).toBe(input);
	});

	it('is split again when someone joins or leaves it', () => {
		const input = edited(1001, [share('a', 334), share('b', 334), share('c', 333)]);
		expect(keptEqualShares(input, imported)).toBe(input);
	});

	it('is split again when it wasn’t an equal split before', () => {
		const input = edited();
		expect(keptEqualShares(input, { ...imported, splitMode: 'exact' })).toBe(input);
		const uneven = { ...imported, splits: [share('a', 300), share('b', 701)] };
		expect(keptEqualShares(input, uneven)).toBe(input);
	});
});
