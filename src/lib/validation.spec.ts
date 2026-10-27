import { describe, expect, it } from 'vitest';
import {
	parseCategory,
	parseSplit,
	normalizeText,
	parseDate,
	parseExpense,
	parseNote,
	parsePayment,
	parseKind,
	parseTint,
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

describe('parseNote', () => {
	it('keeps line breaks, trims, and has none when empty', () => {
		expect(parseNote('  Includes the deposit\r\nand the keys  ')).toEqual({
			ok: true,
			value: 'Includes the deposit\nand the keys'
		});
		expect(parseNote('   ')).toEqual({ ok: true, value: null });
		expect(parseNote(undefined)).toEqual({ ok: true, value: null });
	});

	it('has a length limit', () => {
		expect(parseNote('x'.repeat(501))).toEqual({ ok: false, error: 'expense_note_too_long' });
	});
});

describe('several payers (#39)', () => {
	const group = { memberIds: ['anna', 'ben', 'cara'], currency: 'EUR' };
	const base = {
		title: 'Dinner',
		amount: '90',
		date: '2026-10-27',
		paidBy: 'several',
		category: '',
		splitMode: 'equal',
		participants: ['anna', 'ben', 'cara'],
		inputs: {}
	};

	it('takes what each paid, most first', () => {
		const result = parseExpense({ ...base, payers: { anna: '30', ben: '60', cara: '' } }, group);
		expect(result.ok && result.value.payers).toEqual([
			{ memberId: 'ben', amountCents: 6000 },
			{ memberId: 'anna', amountCents: 3000 }
		]);
		expect(result.ok && result.value.paidBy).toBe('ben');
	});

	it('needs two people and the parts to add up', () => {
		expect(parseExpense({ ...base, payers: { anna: '90' } }, group)).toEqual({
			ok: false,
			error: 'payers_too_few'
		});
		expect(parseExpense({ ...base, payers: { anna: '30', ben: '50' } }, group)).toEqual({
			ok: false,
			error: 'payers_mismatch'
		});
	});
});

describe('parseExpense', () => {
	const group = { memberIds: ['a', 'b', 'c'], currency: 'EUR' };
	const values = {
		title: ' Dinner ',
		amount: '30,00',
		date: '2026-10-21',
		paidBy: 'b',
		participants: ['c', 'a'],
		category: '',
		splitMode: '',
		inputs: {}
	};

	it('splits equally between the participants, in member order', () => {
		expect(parseExpense(values, group)).toEqual({
			ok: true,
			value: {
				title: 'Dinner',
				notes: null,
				amountCents: 3000,
				date: '2026-10-21',
				paidBy: 'b',
				payers: null,
				category: null,
				splitMode: 'equal',
				shares: [
					{ memberId: 'a', shareCents: 1500, input: null },
					{ memberId: 'c', shareCents: 1500, input: null }
				]
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

describe('parseKind and parseTint', () => {
	it('defaults the type and treats an empty color as automatic', () => {
		expect(parseKind('')).toEqual({ ok: true, value: 'other' });
		expect(parseKind('trip')).toEqual({ ok: true, value: 'trip' });
		expect(parseTint('')).toEqual({ ok: true, value: null });
		expect(parseTint('clay')).toEqual({ ok: true, value: 'clay' });
	});

	it('rejects unknown values', () => {
		expect(parseKind('yacht')).toEqual({ ok: false, error: 'kind_invalid' });
		expect(parseTint('red')).toEqual({ ok: false, error: 'tint_invalid' });
	});
});

describe('parseCategory', () => {
	it('treats empty as automatic', () => {
		expect(parseCategory('')).toEqual({ ok: true, value: null });
	});

	it('accepts known categories only', () => {
		expect(parseCategory('dining')).toEqual({ ok: true, value: 'dining' });
		expect(parseCategory('caviar')).toEqual({ ok: false, error: 'category_invalid' });
	});
});

describe('parseSplit', () => {
	const group = { memberIds: ['a', 'b'], currency: 'EUR' };
	const split = (splitMode: string, inputs: Record<string, string>) =>
		parseSplit({ splitMode, participants: [], inputs }, 3000, group);

	it("reads each member's input for the mode", () => {
		expect(split('percent', { a: '25', b: '75' })).toEqual({
			ok: true,
			value: {
				splitMode: 'percent',
				shares: [
					{ memberId: 'a', shareCents: 750, input: 2500 },
					{ memberId: 'b', shareCents: 2250, input: 7500 }
				]
			}
		});
	});

	it('rejects unknown modes and invalid inputs', () => {
		expect(split('thirds', {})).toEqual({ ok: false, error: 'split_mode_invalid' });
		expect(split('exact', { a: 'lots' })).toEqual({ ok: false, error: 'split_input_invalid' });
	});
});
