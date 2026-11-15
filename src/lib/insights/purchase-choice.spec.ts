import { beforeEach, describe, expect, it } from 'vitest';
import { rememberWithPurchase, withPurchaseFor } from './purchase-choice';

describe('the purchase switch, remembered', () => {
	beforeEach(() => {
		const kept = new Map<string, string>();
		globalThis.localStorage = {
			getItem: (key: string) => kept.get(key) ?? null,
			setItem: (key: string, value: string) => void kept.set(key, value),
			removeItem: (key: string) => void kept.delete(key)
		} as Storage;
	});

	it('includes the purchase at first, then as last set, per group', () => {
		expect(withPurchaseFor('car')).toBe(true);
		rememberWithPurchase('car', false);
		expect(withPurchaseFor('car')).toBe(false);
		expect(withPurchaseFor('other')).toBe(true);
		rememberWithPurchase('car', true);
		expect(withPurchaseFor('car')).toBe(true);
	});
});
