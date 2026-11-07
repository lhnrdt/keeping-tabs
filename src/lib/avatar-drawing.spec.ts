import { describe, expect, it } from 'vitest';
import { isDrawingPath } from './avatars';
import { fits, pathOf, simplified } from './avatar-drawing';

describe('a drawn avatar’s path (#158)', () => {
	it('keeps whole numbers inside the square, and leaves out points too close to matter', () => {
		expect(
			simplified([
				[1.2, 1.4],
				[1.6, 1.8],
				[5, 5],
				[60, -3]
			])
		).toEqual([
			[1, 1],
			[5, 5],
			[47, 0]
		]);
	});

	it('is a valid avatar path, with a tap as a dot', () => {
		const d = pathOf([
			[
				[10, 10],
				[20, 20]
			],
			[[30, 30]]
		]);
		expect(d).toBe('M10 10L20 20M30 30L30 30');
		expect(isDrawingPath(d)).toBe(true);
	});

	it('says when a drawing gets too long to keep', () => {
		const long = Array.from({ length: 900 }, (_, i): [number, number] => [i % 40, (i * 7) % 40]);
		expect(fits([long.slice(0, 20)])).toBe(true);
		expect(fits([long])).toBe(false);
	});
});
