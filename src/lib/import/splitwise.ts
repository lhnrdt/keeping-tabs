// Reads a Splitwise group export (CSV): a header "Date, Description, Category, Cost,
// Currency, <one column per person>", then one row per expense or payment with each
// person's net amount (what they paid minus their share), and a closing total row
// without a cost.
// Splitwise translates the header and categories, so they're matched loosely.
import { parseDecimal } from '#lib/decimal.ts';
import { minorDigits } from '#lib/money.ts';
import { LIMITS, parseDate, type Result } from '#lib/validation.ts';
import { fromTextCell } from '#lib/export/csv.ts';
import { parseCsv } from './csv';

export type SplitwiseRow = {
	/** Line in the file, for messages */
	line: number;
	date: string;
	title: string;
	category: string;
	costCents: number;
	/** Net per person, in the order of `people`: positive = paid more than their share */
	nets: number[];
	isPayment: boolean;
	/** The same row gets the same key on every import, so re-imports skip it */
	key: string;
};

export type SkipReason = 'currency' | 'unbalanced' | 'invalid' | 'no_effect';
export type SplitwiseExport = {
	people: string[];
	rows: SplitwiseRow[];
	skipped: { line: number; reason: SkipReason }[];
};

const FIXED_COLUMNS = 5;
const DATE_HEADERS = new Set(['date', 'datum', 'fecha', 'data']);
/** Splitwise's "Payment" category, in the languages it exports */
const PAYMENT_CATEGORIES = new Set([
	'payment',
	'zahlung',
	'pago',
	'paiement',
	'pagamento',
	'betaling',
	'platnosc'
]);

const plain = (text: string) =>
	text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.trim()
		.toLowerCase();

/** ISO dates as Splitwise exports them; also day.month.year */
function toIsoDate(text: string) {
	const german = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text.trim());
	const iso = german
		? `${german[3]}-${german[2].padStart(2, '0')}-${german[1].padStart(2, '0')}`
		: text.trim().slice(0, 10);
	const date = parseDate(iso);
	return date.ok ? date.value : null;
}

/** A short, stable fingerprint of a row (cyrb53) */
function fingerprint(text: string) {
	let h1 = 0xdeadbeef;
	let h2 = 0x41c6ce57;
	for (let i = 0; i < text.length; i++) {
		const code = text.charCodeAt(i);
		h1 = Math.imul(h1 ^ code, 2654435761);
		h2 = Math.imul(h2 ^ code, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function parseSplitwise(text: string, currency: string): Result<SplitwiseExport> {
	const [header, ...lines] = parseCsv(text);
	if (!header || header.length <= FIXED_COLUMNS || !DATE_HEADERS.has(plain(header[0]))) {
		return { ok: false, error: 'import_not_splitwise' };
	}
	const people = header.slice(FIXED_COLUMNS).map((name) => fromTextCell(name.trim()));
	const digits = minorDigits(currency);
	const rows: SplitwiseRow[] = [];
	const skipped: SplitwiseExport['skipped'] = [];
	const seen = new Map<string, number>();

	lines.forEach((fields, i) => {
		const line = i + 2;
		// Blank separator lines, and the closing total row ("Total balance"), which has no cost
		if (fields.every((field) => !field.trim()) || !fields[3]?.trim()) return;

		const [rawDate, rawTitle, rawCategory, rawCost, rawCurrency] = fields;
		if (rawCurrency?.trim().toUpperCase() !== currency) {
			skipped.push({ line, reason: 'currency' });
			return;
		}
		const date = toIsoDate(rawDate);
		const costCents = parseDecimal(rawCost ?? '', digits);
		const nets = people.map((_, p) => parseDecimal(fields[FIXED_COLUMNS + p] ?? '', digits, true));
		if (!date || costCents === null || nets.some((net) => net === null)) {
			skipped.push({ line, reason: 'invalid' });
			return;
		}
		const amounts = nets as number[];
		if (amounts.reduce((sum, net) => sum + net, 0) !== 0) {
			skipped.push({ line, reason: 'unbalanced' });
			return;
		}
		if (amounts.every((net) => net === 0)) {
			skipped.push({ line, reason: 'no_effect' });
			return;
		}

		const title = fromTextCell((rawTitle ?? '').trim()).slice(0, LIMITS.expenseTitle) || '?';
		// Identical rows in one file are different expenses: count them into the key
		const content = [date, title, costCents, currency, amounts.join(',')].join('|');
		const occurrence = (seen.get(content) ?? 0) + 1;
		seen.set(content, occurrence);

		rows.push({
			line,
			date,
			title,
			category: (rawCategory ?? '').trim(),
			costCents,
			nets: amounts,
			isPayment: PAYMENT_CATEGORIES.has(plain(rawCategory ?? '')),
			key: `sw:${fingerprint(`${content}#${occurrence}`)}`
		});
	});

	if (rows.length === 0 && skipped.length === 0) return { ok: false, error: 'import_empty' };
	return { ok: true, value: { people, rows, skipped } };
}
