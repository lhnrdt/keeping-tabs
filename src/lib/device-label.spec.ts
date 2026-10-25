import { describe, expect, it } from 'vitest';
import { deviceLabel } from './device-label';

describe('deviceLabel', () => {
	it.each([
		[
			'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
			'Chrome · Android'
		],
		[
			'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
			'Safari · iPhone'
		],
		[
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
			'Edge · Windows'
		],
		['Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0', 'Firefox · Linux'],
		[
			'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0 Mobile Safari/537.36',
			'Samsung Internet · Android'
		]
	])('names %s', (userAgent, label) => {
		expect(deviceLabel(userAgent)).toBe(label);
	});

	it('gives up on nothing or the unknown', () => {
		expect(deviceLabel(null)).toBeNull();
		expect(deviceLabel('curl/8.0')).toBeNull();
	});
});
