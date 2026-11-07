import { describe, expect, it } from 'vitest';
import { parseDefaultSplitForm } from './default-split-form';

const group = { memberIds: ['a', 'b'], currency: 'EUR' };

describe('the split for new expenses, as set on its page', () => {
	it('is none when it’s equal', () => {
		expect(parseDefaultSplitForm({ splitMode: 'equal', inputs: {} }, group)).toEqual({
			ok: true,
			value: null
		});
	});

	it('keeps percentages and parts', () => {
		expect(
			parseDefaultSplitForm({ splitMode: 'percent', inputs: { a: '60', b: '40' } }, group)
		).toEqual({
			ok: true,
			value: { mode: 'percent', inputs: { a: 6000, b: 4000 } }
		});
		expect(
			parseDefaultSplitForm({ splitMode: 'shares', inputs: { a: '2', b: '1' } }, group)
		).toEqual({
			ok: true,
			value: { mode: 'shares', inputs: { a: 200, b: 100 } }
		});
	});

	it('refuses what doesn’t add up or can’t carry over to any amount', () => {
		expect(
			parseDefaultSplitForm({ splitMode: 'percent', inputs: { a: '60', b: '30' } }, group).ok
		).toBe(false);
		expect(
			parseDefaultSplitForm({ splitMode: 'exact', inputs: { a: '5', b: '5' } }, group).ok
		).toBe(false);
	});
});
