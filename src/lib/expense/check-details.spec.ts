import { describe, expect, it } from 'vitest';
import { checkEntryDetails, checkGroupDetails } from './check-details';

const entry = {
	amountCents: 300,
	paidBy: 'anna',
	splitMode: 'equal',
	splits: [
		{ memberId: 'anna', shareCents: 150 },
		{ memberId: 'ben', shareCents: 150, input: null }
	]
};

describe('checkEntryDetails', () => {
	it('takes what makes sense', () => {
		expect(checkEntryDetails({ ...entry, category: 'other' })).toMatchObject({
			amountCents: 300,
			paidBy: 'anna',
			category: 'other'
		});
	});

	it.each([
		['no object', 'nonsense'],
		['a list', []],
		['nothing', null],
		['a text amount', { ...entry, amountCents: '300' }],
		['a negative amount', { ...entry, amountCents: -1 }],
		['no payer', { ...entry, paidBy: undefined }],
		['splits that are no list', { ...entry, splits: 'all' }],
		['a split without a member', { ...entry, splits: [{ shareCents: 1 }] }],
		['a fractional share', { ...entry, splits: [{ memberId: 'a', shareCents: 0.5 }] }],
		['payers that are no list', { ...entry, payers: {} }],
		['items without names', { ...entry, items: [{ cents: 1, memberIds: [] }] }],
		['an unknown split mode', { ...entry, splitMode: 'magic' }]
	])('refuses %s', (_, read) => {
		expect(checkEntryDetails(read)).toBeNull();
	});

	it('drops the extras that make no sense, and keeps the money', () => {
		const checked = checkEntryDetails({
			...entry,
			category: '<script>',
			originalCurrency: 'not money',
			odometerM: 'far',
			unknown: 'field'
		});
		expect(checked).toMatchObject({ category: null, originalCurrency: null, odometerM: null });
		expect(checked).not.toHaveProperty('unknown');
	});
});

describe('checkGroupDetails', () => {
	it('keeps what makes sense, and leaves out what would crash the page', () => {
		expect(
			checkGroupDetails({
				currency: 'nonsense',
				kind: 'car',
				budgetCents: 'lots',
				simplifyDebts: false
			})
		).toEqual({ kind: 'car', simplifyDebts: false });
	});

	it('takes nothing from what is no object', () => {
		expect(checkGroupDetails('nonsense')).toEqual({});
	});
});
