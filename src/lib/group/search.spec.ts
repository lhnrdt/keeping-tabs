import { describe, expect, it } from 'vitest';
import { likePattern, readQuery } from './search';

describe('search', () => {
	it('reads the trimmed query, if any', () => {
		expect(readQuery(new URLSearchParams('q=%20Pizza%20'))).toBe('Pizza');
		expect(readQuery(new URLSearchParams(''))).toBe('');
		expect(readQuery(new URLSearchParams(`q=${'x'.repeat(200)}`))).toHaveLength(80);
	});

	it('matches anywhere, taking % and _ literally', () => {
		expect(likePattern('Pizza')).toBe('%pizza%');
		expect(likePattern('50%_off!')).toBe('%50!%!_off!!%');
	});
});
