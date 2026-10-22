import { describe, expect, it } from 'vitest';
import { initials } from './members';

describe('initials', () => {
	it('uses first and last word', () => {
		expect(initials('Elisabeth Maria Hecht')).toBe('EH');
	});

	it('handles single names, case and extra spaces', () => {
		expect(initials('  anna ')).toBe('A');
	});

	it('keeps non-latin letters whole', () => {
		expect(initials('Øyvind Ågren')).toBe('ØÅ');
	});
});
