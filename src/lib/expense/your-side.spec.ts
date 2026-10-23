import { describe, expect, it } from 'vitest';
import { yourSide } from './your-side';

const dinner = { paidBy: 'anna', amountCents: 3000 };

describe('yourSide', () => {
	it('is what you lent when you paid', () => {
		expect(yourSide(dinner, 'anna', 1000)).toBe(2000);
		expect(yourSide(dinner, 'anna', 0)).toBe(3000);
	});

	it('is what you borrowed when someone else paid', () => {
		expect(yourSide(dinner, 'ben', 1000)).toBe(-1000);
	});

	it('is nothing when you are not involved or not a member', () => {
		expect(yourSide(dinner, 'cara', 0)).toBeNull();
		expect(yourSide(dinner, null, 0)).toBeNull();
	});
});
