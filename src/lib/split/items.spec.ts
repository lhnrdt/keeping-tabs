import { describe, expect, it } from 'vitest';
import { itemShares, parseItems } from './items';

const MEMBERS = ['a', 'b', 'c'];
const item = (cents: number, ...memberIds: string[]) => ({ name: 'x', cents, memberIds });
const sharesOf = (result: ReturnType<typeof itemShares>) =>
	result.ok
		? Object.fromEntries(result.value.map((share) => [share.memberId, share.shareCents]))
		: result;

describe('parseItems', () => {
	const typed = (...items: unknown[]) => JSON.stringify(items);

	it('reads prices as typed', () => {
		expect(
			parseItems(
				typed({ name: ' Pizza ', price: '12,50', memberIds: ['a', 'a', 'b'] }),
				'EUR',
				MEMBERS
			)
		).toEqual({ ok: true, value: [{ name: 'Pizza', cents: 1250, memberIds: ['a', 'b'] }] });
	});

	it('refuses nothing, nobody, strangers and nonsense', () => {
		expect(parseItems('[]', 'EUR', MEMBERS)).toEqual({ ok: false, error: 'split_items_empty' });
		const nobody = typed({ name: 'x', price: '1', memberIds: [] });
		expect(parseItems(nobody, 'EUR', MEMBERS)).toEqual({ ok: false, error: 'split_item_nobody' });
		const stranger = typed({ name: 'x', price: '1', memberIds: ['z'] });
		expect(parseItems(stranger, 'EUR', MEMBERS)).toEqual({ ok: false, error: 'split_item_nobody' });
		const bad = typed({ name: 'x', price: 'abc', memberIds: ['a'] });
		expect(parseItems(bad, 'EUR', MEMBERS)).toEqual({ ok: false, error: 'split_input_invalid' });
		expect(parseItems('nope', 'EUR', MEMBERS)).toEqual({ ok: false, error: 'split_input_invalid' });
	});
});

describe('itemShares', () => {
	it('shares each item between who had it', () => {
		const shares = itemShares([item(1000, 'a'), item(600, 'a', 'b', 'c')], 1600, 1600);
		expect(sharesOf(shares)).toEqual({ a: 1200, b: 200, c: 200 });
	});

	it('spreads what is left in proportion, adding up exactly', () => {
		const shares = itemShares([item(1000, 'a'), item(500, 'b')], 1500, 1800);
		expect(sharesOf(shares)).toEqual({ a: 1200, b: 600 });
		const odd = itemShares([item(100, 'a'), item(100, 'b'), item(100, 'c')], 300, 1000);
		expect(odd.ok && odd.value.reduce((sum, share) => sum + share.shareCents, 0)).toBe(1000);
	});

	it('carries over to the group currency', () => {
		expect(sharesOf(itemShares([item(100, 'a'), item(300, 'b')], 400, 1000))).toEqual({
			a: 250,
			b: 750
		});
	});

	it('refuses items over the amount', () => {
		expect(itemShares([item(2000, 'a')], 1000, 1000)).toEqual({
			ok: false,
			error: 'split_items_over'
		});
	});
});
