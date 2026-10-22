import { describe, expect, it } from 'vitest';
import { newRecoveryKey, normalizeRecoveryKey } from './recovery-key';

describe('newRecoveryKey', () => {
	it('is five groups of four Crockford characters', () => {
		expect(newRecoveryKey()).toMatch(/^([0-9A-HJKMNP-TV-Z]{4}-){4}[0-9A-HJKMNP-TV-Z]{4}$/);
	});

	it('normalizes back to itself without dashes', () => {
		const key = newRecoveryKey();
		expect(normalizeRecoveryKey(key)).toBe(key.replace(/-/g, ''));
	});
});

describe('normalizeRecoveryKey', () => {
	it('forgives case, spaces and look-alike letters', () => {
		expect(normalizeRecoveryKey('k7qd 2m9x-oil0 abcd efgh')).toBe('K7QD2M9X0110ABCDEFGH');
	});

	it('rejects wrong lengths and letters outside the alphabet', () => {
		expect(normalizeRecoveryKey('ABCD')).toBeNull();
		expect(normalizeRecoveryKey('UUUU-UUUU-UUUU-UUUU-UUUU')).toBeNull();
	});
});
