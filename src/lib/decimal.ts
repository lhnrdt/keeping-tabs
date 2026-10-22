// Decimal text to integers without float math (E-2), e.g. "12,5" with 2 digits → 1250.

/** Empty → 0; null when not a number or with more decimals than `digits`. */
export function parseDecimal(text: string, digits: number, signed = false): number | null {
	const trimmed = text.trim();
	const match = /^([+-]?)(\d{0,12})(?:[.,](\d*))?$/.exec(trimmed);
	if (!match) return null;
	const [, sign, whole, fraction = ''] = match;
	if (sign && !signed) return null;
	if (fraction.length > digits || (!whole && !fraction && trimmed !== '')) return null;
	const value = Number((whole || '0') + fraction.padEnd(digits, '0'));
	return sign === '-' ? -value : value;
}
