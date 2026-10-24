import { describe, expect, it } from 'vitest';
import { formatAvatar, parseAvatar } from './avatars';

describe('avatars', () => {
	it('reads an icon or initials on a tint, and writes it back the same', () => {
		expect(parseAvatar('deer:moss')).toEqual({ icon: 'deer', tint: 'moss' });
		expect(parseAvatar('initials:clay')).toEqual({ icon: null, tint: 'clay' });
		expect(formatAvatar({ icon: 'deer', tint: 'moss' })).toBe('deer:moss');
		expect(formatAvatar({ icon: null, tint: 'clay' })).toBe('initials:clay');
	});

	it.each([null, '', 'deer', 'dragon:moss', 'deer:purple', 'deer:moss:x', 42])(
		'refuses %s',
		(value) => {
			expect(parseAvatar(value)).toBeNull();
		}
	);
});
