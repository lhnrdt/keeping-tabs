import { describe, expect, it } from 'vitest';
import { qrPath } from './qr';

describe('qrPath', () => {
	it('draws a square with room around it, larger for longer text', () => {
		const short = qrPath('https://example.com');
		expect(short.path).toMatch(/^M\d+ \d+h1v1h-1z/);
		expect(short.size).toBeGreaterThan(21);
		expect(qrPath(`https://example.com/${'x'.repeat(200)}`).size).toBeGreaterThan(short.size);
	});
});
