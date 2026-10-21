import { describe, expect, it } from 'vitest';
import {
	normalizeText,
	parseDate,
	parseExpense,
	parsePayment,
	parseCurrency,
	parseDescription,
	parseGroupName,
	parseMemberName,
	parseMemberNames
} from './validation';

describe('normalizeText', () => {
	it('trims and collapses whitespace', () => {
		expect(normalizeText('  Ski   trip \n 2026 ')).toBe('Ski trip 2026');
	});

	it('treats non-strings as empty', () => {
		expect(normalizeText(null)).toBe('');
	});
});

describe('parseGroupName', () => {
	it('accepts a normal name', () => {
		expect(parseGroupName(' Flat ')).toEqual({ ok: true, value: 'Flat' });
	});

	it('rejects empty and too long names', () => {
		expect(parseGroupName('   ')).toEqual({ ok: false, error: 'group_name_required' });
		expect(parseGroupName('x'.repeat(61))).toEqual({ ok: false, error: 'group_name_too_long' });
	});
});

describe('parseDescription', () => {
	it('is optional and keeps line breaks', () => {
		expect(parseDescription('')).toEqual({ ok: true, value: null });
		expect(parseDescription(' a\nb ')).toEqual({ ok: true, value: 'a\nb' });
	});
});

describe('parseCurrency', () => {
	it('accepts ISO codes case-insensitively', () => {
		expect(parseCurrency('chf')).toEqual({ ok: true, value: 'CHF' });
	});

	it('rejects malformed codes', () => {
		expect(parseCurrency('EURO')).toEqual({ ok: false, error: 'currency_invalid' });
	});
});

describe('parseMemberName', () => {
	it('rejects names already in the group, ignoring case', () => {
		expect(parseMemberName('anna', ['Anna'])).toEqual({ ok: false, error: 'member_name_taken' });
	});
});

describe('parseMemberNames', () => {
	it('skips blank rows', () => {
		expect(parseMemberNames(['Anna', '', ' Ben '])).toEqual({ ok: true, value: ['Anna', 'Ben'] });
	});

	it('rejects duplicates within the list', () => {
		expect(parseMemberNames(['Anna', 'ANNA'])).toEqual({ ok: false, error: 'member_name_taken' });
	});

	it('needs at least one name', () => {
		expect(parseMemberNames(['', ' '])).toEqual({ ok: false, error: 'member_name_required' });
	});
});

describe('parseDate', () => {
	it('accepts real ISO dates only', () => {
		expect(parseDate('2026-02-28')).toEqual({ ok: true, value: '2026-02-28' });
		expect(parseDate('2026-02-30')).toEqual({ ok: false, error: 'date_invalid' });
		expect(parseDate('28.02.2026')).toEqual({ ok: false, error: 'date_invalid' });
	});
});

describe('parseExpense', () => {
	const group = { memberIds: ['a', 'b', 'c'], currency: 'EUR' };
	const values = {
		title: ' Dinner ',
		amount: '30,00',
		date: '2026-10-21',
		paidBy: 'b',
		participants: ['c', 'a']
	};

	it('returns participants in member order', () => {
		expect(parseExpense(values, group)).toEqual({
			ok: true,
			value: {
				title: 'Dinner',
				amountCents: 3000,
				date: '2026-10-21',
				paidBy: 'b',
				participants: ['a', 'c']
			}
		});
	});

	it('rejects payers and participants outside the group', () => {
		expect(parseExpense({ ...values, paidBy: 'x' }, group)).toEqual({
			ok: false,
			error: 'payer_invalid'
		});
		expect(parseExpense({ ...values, participants: ['x'] }, group)).toEqual({
			ok: false,
			error: 'participants_required'
		});
	});

	it('rejects invalid amounts', () => {
		expect(parseExpense({ ...values, amount: '0' }, group)).toEqual({
			ok: false,
			error: 'amount_invalid'
		});
	});
});

describe('parsePayment', () => {
	const group = { memberIds: ['a', 'b'], currency: 'EUR' };
	const values = { from: 'b', to: 'a', amount: '21,40', date: '2026-10-21' };

	it('accepts a payment between two members', () => {
		expect(parsePayment(values, group)).toEqual({
			ok: true,
			value: { from: 'b', to: 'a', amountCents: 2140, date: '2026-10-21' }
		});
	});

	it('rejects paying yourself and unknown members', () => {
		expect(parsePayment({ ...values, to: 'b' }, group)).toEqual({
			ok: false,
			error: 'payment_same_member'
		});
		expect(parsePayment({ ...values, to: 'x' }, group)).toEqual({
			ok: false,
			error: 'recipient_invalid'
		});
	});
});
