import { describe, expect, it } from 'vitest';
import { parseSealedImport } from './sealed-import';

const SEALED = 'enc1.abcdefgh.title_.AAAA';
const ID = '11111111-1111-4111-8111-111111111111';
const entry = {
	type: 'expense',
	title: SEALED,
	date: '2026-01-02',
	sealedDetails: SEALED,
	key: 'k'
};
const valid = { newMembers: [{ id: ID, name: SEALED }], entries: [entry] };

describe('parseSealedImport', () => {
	it('takes what the browser sends', () => {
		expect(parseSealedImport(valid)).not.toBeNull();
	});

	it.each([
		['plain text', { entries: [{ ...entry, title: 'Pizza' }] }],
		['plain money', { entries: [{ ...entry, sealedDetails: '{"amountCents":1}' }] }],
		['a bad date', { entries: [{ ...entry, date: 'soon' }] }],
		['a plain name', { newMembers: [{ id: ID, name: 'Ben' }] }],
		['a made up id', { newMembers: [{ id: 'x', name: SEALED }] }]
	])('refuses %s', (_, change) => {
		expect(parseSealedImport({ ...valid, ...change })).toBeNull();
	});
});
