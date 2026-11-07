import { describe, expect, it, vi } from 'vitest';

vi.mock('cloudflare:workers', () => ({ env: {} }));
const { isSubscription, mutedKinds } = await import('./push');

describe('push (#56)', () => {
	it('takes only a browser subscription with its keys', () => {
		const sub = {
			endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
			keys: { p256dh: 'x', auth: 'y' }
		};
		expect(isSubscription(sub)).toBe(true);
		expect(isSubscription({ ...sub, endpoint: 'http://insecure.example' })).toBe(false);
		expect(isSubscription({ endpoint: sub.endpoint })).toBe(false);
		expect(isSubscription(null)).toBe(false);
	});
});

describe('notification kinds switched off (#267)', () => {
	it('are read from what’s stored, leaving out anything unknown', () => {
		expect(mutedKinds('comment,joined,bogus')).toEqual(['comment', 'joined']);
		expect(mutedKinds(null)).toEqual([]);
	});
});
