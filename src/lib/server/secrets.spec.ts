import { describe, expect, it } from 'vitest';
import { hashSecret, randomSecret } from './secrets';

describe('randomSecret', () => {
	it('is URL-safe with the expected length', () => {
		expect(randomSecret(32)).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(randomSecret(16)).toMatch(/^[A-Za-z0-9_-]{22}$/);
	});
});

describe('hashSecret', () => {
	it('is a stable hex SHA-256', async () => {
		expect(await hashSecret('abc')).toBe(
			'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
		);
	});
});
