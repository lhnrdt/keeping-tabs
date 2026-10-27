// Exchange rates for expenses in another currency (#54): the European Central Bank's daily
// reference rates through Frankfurter (free, no key). Every rate is worked out through the
// euro, as the ECB publishes them: 1 JPY in GBP = (1 EUR in GBP) / (1 EUR in JPY). For a day
// without rates (a weekend, a date ahead) it answers with the day before. An unknown
// currency or no answer: null, and the rate is typed in by hand.
const SOURCE = 'https://api.frankfurter.dev/v1';
const TIMEOUT_MS = 3000;
const EURO = 'EUR';

/** 1 EUR in each of these currencies on or just before the date; null without an answer */
async function euroRates(codes: string[], date: string): Promise<Record<string, number> | null> {
	if (codes.length === 0) return {};
	const day = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : 'latest';
	const url = `${SOURCE}/${day}?base=${EURO}&symbols=${codes.map(encodeURIComponent).join(',')}`;
	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(TIMEOUT_MS),
			// A past day's rates never change: let Cloudflare keep them
			cf: { cacheTtl: 60 * 60 * 24, cacheEverything: true }
		} as RequestInit);
		if (!response.ok) return null;
		return ((await response.json()) as { rates?: Record<string, number> }).rates ?? null;
	} catch {
		return null;
	}
}

/** 1 `from` in `to`, through the euro; null when there's no rate for either */
export async function rateFor(from: string, to: string, date: string): Promise<number | null> {
	if (from === to) return 1;
	const rates = await euroRates(
		[from, to].filter((code) => code !== EURO),
		date
	);
	if (!rates) return null;
	const perEuro = (code: string) => (code === EURO ? 1 : rates[code]);
	const [fromRate, toRate] = [perEuro(from), perEuro(to)];
	return fromRate > 0 && toRate > 0 ? toRate / fromRate : null;
}
