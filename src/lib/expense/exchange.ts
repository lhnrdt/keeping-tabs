// Expenses in another currency (#54): typed in theirs, kept in the group's, converted at a
// rate per unit (1 JPY = 0.0056389 EUR). Balances and everything else stay in the group's
// currency; the original amount and rate are kept to show and edit.
import { minorDigits } from '#lib/money.ts';

/** What was typed, and how it became the group's amount */
export type Original = { currency: string; amountCents: number; rate: string };

/** Up to 9 decimals, more than zero, below a million */
const RATE = /^\d{1,6}(?:[.,]\d{1,9})?$/;

export function parseRate(text: string): string | null {
	const trimmed = text.trim();
	if (!RATE.test(trimmed)) return null;
	const normalized = trimmed.replace(',', '.');
	return Number(normalized) > 0 ? normalized : null;
}

/** The amount in the group's currency, rounded to its smallest unit */
export function convert(original: Original, to: string): number {
	const shift = 10 ** (minorDigits(to) - minorDigits(original.currency));
	return Math.round(original.amountCents * Number(original.rate) * shift);
}

/** A rate as shown and typed: no needless zeros, at most 6 significant digits after the point */
export const formatRate = (rate: number) => String(Number(rate.toPrecision(6)));

/** The currencies with daily reference rates (European Central Bank via Frankfurter) */
export const RATE_CURRENCIES = [
	'AUD',
	'BRL',
	'CAD',
	'CHF',
	'CNY',
	'CZK',
	'DKK',
	'EUR',
	'GBP',
	'HKD',
	'HUF',
	'IDR',
	'ILS',
	'INR',
	'ISK',
	'JPY',
	'KRW',
	'MXN',
	'MYR',
	'NOK',
	'NZD',
	'PHP',
	'PLN',
	'RON',
	'SEK',
	'SGD',
	'THB',
	'TRY',
	'USD',
	'ZAR'
] as const;
