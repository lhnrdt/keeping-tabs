import { afterEach, describe, expect, it, vi } from 'vitest';
import { needsFresh, wantFresh } from './freshness';

describe('when the kept copy will not do (#347)', () => {
	afterEach(() => vi.useRealTimers());

	it('is for a few seconds after something changed, then the kept copy shows again', () => {
		vi.useFakeTimers();
		vi.stubGlobal('navigator', {});
		expect(needsFresh()).toBe(false);
		wantFresh();
		expect(needsFresh()).toBe(true);
		vi.advanceTimersByTime(10_000);
		expect(needsFresh()).toBe(false);
	});

	it('tells the service worker', () => {
		const postMessage = vi.fn();
		vi.stubGlobal('navigator', { serviceWorker: { controller: { postMessage } } });
		wantFresh();
		expect(postMessage).toHaveBeenCalledWith({ type: 'fresh' });
	});
});
