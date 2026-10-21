import { describe, expect, it } from 'vitest';
import {
	normalizeText,
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
