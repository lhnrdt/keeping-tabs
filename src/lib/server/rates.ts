// Exchange rates for expenses in another currency (#54): the European Central Bank's daily
// reference rates through Frankfurter (free, no key). Every rate is worked out through the
// euro, as the ECB publishes them: 1 JPY in GBP = (1 EUR in GBP) / (1 EUR in JPY). For a day
// without rates (a weekend, a date ahead) it answers with the day before. An unknown
// currency or no answer: null, and the rate is typed in by hand.
import { env } from 'cloudflare:workers';
import { formatRate, RATE_CURRENCIES } from '#lib/expense/exchange.ts';

const SOURCE = 'https://api.frankfurter.dev/v1';
const TIMEOUT_MS = 3000;
const EURO = 'EUR';

/** Tests run without the real source: TEST_EURO_RATES is like "USD=2,GBP=0.5" */
function fixedRates() {
	const text = (env as { TEST_EURO_RATES?: string }).TEST_EURO_RATES;
	if (!text) return null;
	return Object.fromEntries(
		text.split(',').map((pair) => {
			const [code, rate] = pair.split('=');
			return [code, Number(rate)];
		})
	);
}

/** 1 EUR in each of these currencies on or just before the date; null without an answer */
async function euroRates(codes: string[], date: string): Promise<Record<string, number> | null> {
	if (codes.length === 0) return {};
	const fixed = fixedRates();
	if (fixed) return fixed;
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

/** Today's rate from every currency with rates to this one (#238), or nothing without an answer */
export async function ratesTo(to: string): Promise<Record<string, string>> {
	const rates = await euroRates(
		RATE_CURRENCIES.filter((code) => code !== EURO),
		''
	);
	if (!rates) return {};
	const perEuro = (code: string) => (code === EURO ? 1 : rates[code]);
	const target = perEuro(to);
	if (!(target > 0)) return {};
	return Object.fromEntries(
		RATE_CURRENCIES.flatMap((code) =>
			perEuro(code) > 0 ? [[code, formatRate(target / perEuro(code))]] : []
		)
	);
}
