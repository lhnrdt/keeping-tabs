const FALLBACK = ['CHF', 'EUR', 'GBP', 'USD'];

export const DEFAULT_CURRENCY = 'EUR';

/** ISO 4217 codes with names in the given locale, for the currency picker. */
export function currencyOptions(locale: string) {
	let codes: string[];
	try {
		codes = Intl.supportedValuesOf('currency');
	} catch {
		codes = FALLBACK;
	}
	let names: Intl.DisplayNames | undefined;
	try {
		names = new Intl.DisplayNames([locale], { type: 'currency' });
	} catch {
		names = undefined;
	}
	return codes.map((code) => {
		const name = names?.of(code);
		return { code, label: name && name !== code ? `${code} – ${name}` : code };
	});
}
