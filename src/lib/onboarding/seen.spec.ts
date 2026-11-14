import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adopt, declineAll, hasSeen, markSeen, mayShow, startAgain } from './seen';

const storage = () => {
	const items = new Map<string, string>();
	return {
		getItem: (key: string) => items.get(key) ?? null,
		setItem: (key: string, value: string) => void items.set(key, value)
	};
};

describe('what of the onboarding was seen (#331)', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', storage());
		vi.stubGlobal('sessionStorage', storage());
		vi.stubGlobal('navigator', { webdriver: false });
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('{}'))
		);
	});

	it('is once per person: what their other devices saw counts here, and this one tells the server what it saw', () => {
		adopt(['home']);
		expect(hasSeen('home')).toBe(true);
		expect(fetch).not.toHaveBeenCalled();
		markSeen('group');
		expect(fetch).toHaveBeenLastCalledWith(
			'/you/onboarding',
			expect.objectContaining({ body: JSON.stringify({ seen: ['home', 'group'] }) })
		);
		// Seen here before this device was anyone's: sent once it is
		adopt([]);
		expect(fetch).toHaveBeenLastCalledWith(
			'/you/onboarding',
			expect.objectContaining({ body: JSON.stringify({ seen: ['home', 'group'] }) })
		);
	});

	it('starts again everywhere', () => {
		startAgain();
		expect(fetch).toHaveBeenLastCalledWith(
			'/you/onboarding',
			expect.objectContaining({ body: JSON.stringify({ again: true }) })
		);
	});

	it('remembers each part', () => {
		expect(hasSeen('home')).toBe(false);
		markSeen('home');
		expect(hasSeen('home')).toBe(true);
		expect(hasSeen('group')).toBe(false);
	});

	it('shows none of it once declined, and all of it again when asked', () => {
		declineAll();
		expect(hasSeen('group')).toBe(true);
		startAgain();
		expect(hasSeen('group')).toBe(false);
	});

	it('stays quiet for automated browsers unless asked for again', () => {
		vi.stubGlobal('navigator', { webdriver: true });
		expect(mayShow()).toBe(false);
		startAgain();
		expect(mayShow()).toBe(true);
	});

	it('copes without storage', () => {
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			}
		});
		expect(hasSeen('home')).toBe(false);
		expect(() => markSeen('home')).not.toThrow();
	});
});
