import { describe, expect, it } from 'vitest';
import { parseDecimal } from './decimal';

describe('parseDecimal', () => {
	it.each([
		['12,5', 2, false, 1250],
		['12.50', 2, false, 1250],
		['', 2, false, 0],
		['-3.2', 2, true, -320],
		['+4', 0, true, 4]
	] as const)('%s (%i digits, signed %s) → %i', (text, digits, signed, value) => {
		expect(parseDecimal(text, digits, signed)).toBe(value);
	});

	it.each([
		['-3', 2, false],
		['1.234', 2, false],
		['abc', 2, false],
		['-', 2, true]
	] as const)('rejects %s', (text, digits, signed) => {
		expect(parseDecimal(text, digits, signed)).toBeNull();
	});
});
