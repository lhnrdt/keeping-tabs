import { describe, expect, it } from 'vitest';
import { parseSealedImport } from './sealed-import';

const SEALED = 'enc1.abcdefgh.title_.AAAA';
const entry = {
	type: 'expense',
	title: SEALED,
	date: '2026-01-02',
	amountCents: 300,
	paidBy: 0,
	shares: [
		{ person: 0, shareCents: 100 },
		{ person: 1, shareCents: 200 }
	],
	splitMode: 'exact',
	category: null,
	sealedDetails: SEALED,
	key: 'sealed:x'
};
const valid = { memberOf: ['m1', null], names: [SEALED, SEALED], entries: [entry] };

describe('parseSealedImport', () => {
	it('takes what the browser sends', () => {
		expect(parseSealedImport(valid, ['m1'])).not.toBeNull();
	});

	it.each([
		['plain text', { entries: [{ ...entry, title: 'Pizza' }] }],
		['a plain category', { entries: [{ ...entry, category: 'food' }] }],
		['shares that don’t add up', { entries: [{ ...entry, amountCents: 301 }] }],
		['someone unknown', { entries: [{ ...entry, paidBy: 2 }] }],
		['another group’s member', { memberOf: ['other', null] }],
		['the same member twice', { memberOf: ['m1', 'm1'] }],
		['a plain name', { names: ['Ben', SEALED] }]
	])('refuses %s', (_, change) => {
		expect(parseSealedImport({ ...valid, ...change }, ['m1'])).toBeNull();
	});
});
