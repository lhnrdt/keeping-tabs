import { describe, expect, it } from 'vitest';
import { safePath } from './safe-redirect';

describe('safePath', () => {
	it('keeps paths of this site, with their query', () => {
		expect(safePath('/g/abc?tab=group')).toBe('/g/abc?tab=group');
	});

	it.each(['//evil.com', 'https://evil.com', '/\\evil.com', '', null, 42])(
		'falls back for %s',
		(value) => {
			expect(safePath(value, '/home')).toBe('/home');
		}
	);
});
