// What people type per member, as integers so no float math is involved (E-2):
// exact and adjust in minor units, percent in hundredths of a percent, shares in
// hundredths of a part.
import { parseDecimal } from '#lib/decimal.ts';
import { minorDigits } from '#lib/money.ts';
import type { SplitMode } from './modes';

/** Decimal places accepted per mode (exact and adjust follow the currency) */
const PERCENT_DIGITS = 2;
const SHARES_DIGITS = 2;

const digitsFor = (mode: SplitMode, currency: string) =>
	mode === 'percent' ? PERCENT_DIGITS : mode === 'shares' ? SHARES_DIGITS : minorDigits(currency);

/** A member's typed input for a mode; empty counts as 0, null means invalid. */
export const parseSplitInput = (mode: SplitMode, text: string, currency: string) =>
	parseDecimal(text, digitsFor(mode, currency), mode === 'adjust');

/** Back to text for editing: 1250 → "12.5" (percent, shares) or "12.50" (money). */
export function formatSplitInput(mode: SplitMode, value: number, currency: string): string {
	const digits = digitsFor(mode, currency);
	const sign = value < 0 ? '-' : '';
	const text = String(Math.abs(value)).padStart(digits + 1, '0');
	const whole = digits ? text.slice(0, -digits) : text;
	let fraction = digits ? text.slice(-digits) : '';
	if (mode === 'percent' || mode === 'shares') fraction = fraction.replace(/0+$/, '');
	return sign + whole + (fraction ? `.${fraction}` : '');
}

/** A saved expense's split inputs as form values, by member id */
export const splitInputValues = (
	expense: { splitMode: SplitMode; splits: { memberId: string; input: number | null }[] },
	currency: string
) =>
	Object.fromEntries(
		expense.splits
			.filter((split) => split.input !== null)
			.map((split) => [split.memberId, formatSplitInput(expense.splitMode, split.input!, currency)])
	);
