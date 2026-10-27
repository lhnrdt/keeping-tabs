import { currencyLabel } from '#lib/money.ts';

const FALLBACK = ['CHF', 'EUR', 'GBP', 'USD'];

export const DEFAULT_CURRENCY = 'EUR';

/** ISO 4217 codes with symbols and names in the given locale, for the currency picker. */
export function currencyOptions(locale: string) {
	let codes: string[];
	try {
		codes = Intl.supportedValuesOf('currency');
	} catch {
		codes = FALLBACK;
	}
	return codes.map((code) => ({ code, label: currencyLabel(code, locale) }));
}
