import { afterEach, describe, expect, it, vi } from 'vitest';
import { logError } from './error-log';

describe('logError', () => {
	afterEach(() => vi.restoreAllMocks());

	it('writes one JSON line with the release and route, for Workers Logs', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		logError({ error: new TypeError('boom'), route: '/g/[token]', method: 'POST' });
		expect(spy).toHaveBeenCalledOnce();
		const line = JSON.parse(spy.mock.calls[0][0] as string);
		expect(line).toMatchObject({
			event: 'app_error',
			version: expect.any(String),
			route: '/g/[token]',
			method: 'POST',
			name: 'TypeError',
			message: 'boom'
		});
		expect(line.stack).toContain('boom');
	});

	it('also logs things thrown that are not errors', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		logError({ error: 'oops', route: null, method: 'GET' });
		expect(JSON.parse(spy.mock.calls[0][0] as string)).toMatchObject({
			name: 'NonError',
			message: 'oops'
		});
	});
});
