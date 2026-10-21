import { describe, expect, it } from 'vitest';
import {
	amountInputValue,
	balances,
	formatAmount,
	minorDigits,
	parseAmount,
	splitEqual
} from './money';

describe('minorDigits', () => {
	it('follows the currency', () => {
		expect(minorDigits('EUR')).toBe(2);
		expect(minorDigits('JPY')).toBe(0);
		expect(minorDigits('BHD')).toBe(3);
	});
});

describe('parseAmount', () => {
	it('accepts dot or comma decimals', () => {
		expect(parseAmount('12.5', 'EUR')).toBe(1250);
		expect(parseAmount(' 12,50 ', 'EUR')).toBe(1250);
		expect(parseAmount('12', 'EUR')).toBe(1200);
		expect(parseAmount('0.01', 'EUR')).toBe(1);
	});

	it('respects the currency precision', () => {
		expect(parseAmount('1200', 'JPY')).toBe(1200);
		expect(parseAmount('12.5', 'JPY')).toBeNull();
		expect(parseAmount('12.001', 'EUR')).toBeNull();
	});

	it('rejects zero, negatives and garbage', () => {
		for (const input of ['0', '0.00', '-5', '', 'abc', '1,234.56', '1e3']) {
			expect(parseAmount(input, 'EUR')).toBeNull();
		}
	});

	it('does not lose precision on large amounts', () => {
		expect(parseAmount('999999999999.99', 'EUR')).toBe(99999999999999);
	});
});

describe('amountInputValue', () => {
	it('round-trips with parseAmount', () => {
		expect(amountInputValue(1250, 'EUR')).toBe('12.50');
		expect(amountInputValue(5, 'EUR')).toBe('0.05');
		expect(amountInputValue(1200, 'JPY')).toBe('1200');
		expect(parseAmount(amountInputValue(123456, 'BHD'), 'BHD')).toBe(123456);
	});
});

describe('formatAmount', () => {
	it('formats in the locale', () => {
		expect(formatAmount(1250, 'EUR', 'de')).toBe('12,50 €');
		expect(formatAmount(1250, 'USD', 'en')).toBe('$12.50');
	});
});

describe('splitEqual', () => {
	it('gives the remainder to the first participants', () => {
		expect(splitEqual(1000, ['a', 'b', 'c'])).toEqual([
			{ memberId: 'a', shareCents: 334 },
			{ memberId: 'b', shareCents: 333 },
			{ memberId: 'c', shareCents: 333 }
		]);
	});

	it('always sums to the amount', () => {
		for (const amount of [1, 2, 99, 100, 101, 12345]) {
			for (let n = 1; n <= 7; n++) {
				const ids = Array.from({ length: n }, (_, i) => String(i));
				const total = splitEqual(amount, ids).reduce((sum, s) => sum + s.shareCents, 0);
				expect(total).toBe(amount);
			}
		}
	});
});

describe('balances', () => {
	it('credits the payer and debits the participants', () => {
		const result = balances(
			['a', 'b', 'c'],
			[
				{ paidBy: 'a', amountCents: 900, splits: splitEqual(900, ['a', 'b', 'c']) },
				{ paidBy: 'b', amountCents: 300, splits: [{ memberId: 'a', shareCents: 300 }] }
			]
		);
		expect(Object.fromEntries(result)).toEqual({ a: 300, b: 0, c: -300 });
	});

	it('sums to zero', () => {
		const result = balances(
			['a', 'b'],
			[{ paidBy: 'a', amountCents: 1001, splits: splitEqual(1001, ['a', 'b']) }]
		);
		expect([...result.values()].reduce((x, y) => x + y, 0)).toBe(0);
	});
});
