import { describe, expect, it } from 'vitest';
import { limitKindOf } from './rate-limit-kinds';

const at = (path: string) => new URL(path, 'https://app.example');

describe('limitKindOf', () => {
	it('lets reading through', () => {
		expect(limitKindOf('GET', at('/welcome'))).toBeNull();
		expect(limitKindOf('HEAD', at('/g/abc'))).toBeNull();
	});

	it.each([
		'/welcome?next=%2F',
		'/device/link?/use',
		'/you/devices?/restore',
		'/device/passkey/login'
	])('counts %s as guessing a secret', (path) => {
		expect(limitKindOf('POST', at(path))).toBe('secret');
	});

	it('counts creating a group on its own', () => {
		expect(limitKindOf('POST', at('/new'))).toBe('newGroup');
	});

	it.each(['/g/abc?/addMember', '/g/abc/expenses/new?/save', '/you/devices?/createLink', '/note'])(
		'counts %s as a write',
		(path) => {
			expect(limitKindOf('POST', at(path))).toBe('write');
		}
	);
});
