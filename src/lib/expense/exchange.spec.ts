import { describe, expect, it } from 'vitest';
import { convert, formatRate, parseRate } from './exchange';

describe('expenses in another currency (#54)', () => {
	it('reads a rate typed either way', () => {
		expect(parseRate('0.0056389')).toBe('0.0056389');
		expect(parseRate('1,08')).toBe('1.08');
		expect(parseRate('0')).toBeNull();
		expect(parseRate('-1')).toBeNull();
		expect(parseRate('abc')).toBeNull();
	});

	it('converts to the group’s smallest unit', () => {
		// ¥3,000 (no decimals) at 0.0056389 → €16.92
		expect(convert({ currency: 'JPY', amountCents: 3000, rate: '0.0056389' }, 'EUR')).toBe(1692);
		// $12.50 at 0.92 → €11.50
		expect(convert({ currency: 'USD', amountCents: 1250, rate: '0.92' }, 'EUR')).toBe(1150);
		// €10.00 at 160.5 → ¥1,605
		expect(convert({ currency: 'EUR', amountCents: 1000, rate: '160.5' }, 'JPY')).toBe(1605);
	});

	it('shows rates without needless digits', () => {
		expect(formatRate(0.0056389)).toBe('0.0056389');
		expect(formatRate(1.0800000001)).toBe('1.08');
	});
});
