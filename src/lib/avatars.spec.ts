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

	it('reads a drawing, only of lines, and writes it back the same (#158)', () => {
		const drawn = 'drawn:sky:1:M10 12L14 16L20 18M30 30L32 34';
		expect(parseAvatar(drawn)).toEqual({
			icon: null,
			tint: 'sky',
			drawing: { width: 1, d: 'M10 12L14 16L20 18M30 30L32 34' }
		});
		expect(formatAvatar(parseAvatar(drawn)!)).toBe(drawn);
	});

	it.each([
		'drawn:sky:1:M10 12L14 16"/><script>',
		'drawn:sky:7:M10 12',
		'drawn:sky:1:C10 12 3 4 5 6',
		'drawn:sky:1:',
		'drawn:purple:1:M1 1',
		`drawn:sky:1:${'M1 1'.repeat(1000)}`
	])('refuses the drawing %s', (value) => {
		expect(parseAvatar(value)).toBeNull();
	});
});
