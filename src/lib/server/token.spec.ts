import { describe, expect, it } from 'vitest';
import { newShareToken, SHARE_TOKEN_PATTERN } from './token';

describe('newShareToken', () => {
	it('is 22 URL-safe characters', () => {
		for (let i = 0; i < 100; i++) expect(newShareToken()).toMatch(SHARE_TOKEN_PATTERN);
	});

	it('does not repeat', () => {
		const tokens = new Set(Array.from({ length: 1000 }, newShareToken));
		expect(tokens.size).toBe(1000);
	});
});
