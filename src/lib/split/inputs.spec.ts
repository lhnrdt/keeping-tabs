import { describe, expect, it } from 'vitest';
import { formatSplitInput, parseSplitInput } from './inputs';

describe('parseSplitInput', () => {
	it.each([
		['exact', '12,50', 1250],
		['exact', '', 0],
		['percent', '33.33', 3333],
		['percent', '50', 5000],
		['shares', '1.5', 150],
		['adjust', '-5', -500],
		['adjust', '+2.5', 250]
	] as const)('%s %s → %s', (mode, text, value) => {
		expect(parseSplitInput(mode, text, 'EUR')).toBe(value);
	});

	it.each([
		['exact', '-5'],
		['percent', '1.234'],
		['shares', 'two'],
		['adjust', '-']
	] as const)('rejects %s %s', (mode, text) => {
		expect(parseSplitInput(mode, text, 'EUR')).toBeNull();
	});

	it('follows the currency for money', () => {
		expect(parseSplitInput('exact', '500', 'JPY')).toBe(500);
		expect(parseSplitInput('exact', '5.5', 'JPY')).toBeNull();
	});
});

describe('formatSplitInput', () => {
	it.each([
		['exact', 1250, '12.50'],
		['percent', 3333, '33.33'],
		['percent', 5000, '50'],
		['shares', 150, '1.5'],
		['adjust', -500, '-5.00']
	] as const)('%s %s → %s', (mode, value, text) => {
		expect(formatSplitInput(mode, value, 'EUR')).toBe(text);
	});
});
