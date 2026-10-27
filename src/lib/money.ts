// All amounts are integer minor units (E-2). Floats appear only when formatting.

import { payersOf, type Payer } from './expense/payers';

/** Number of minor-unit digits for a currency, e.g. 2 for EUR, 0 for JPY. */
export function minorDigits(currency: string): number {
	return (
		new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
			.maximumFractionDigits ?? 2
	);
}

/**
 * Parses user input like "12.5", "12,50" or "1250" into minor units.
 * Returns null for anything else, including zero and thousands separators.
 */
export function parseAmount(input: string, currency: string): number | null {
	const digits = minorDigits(currency);
	const match = /^(\d{1,12})(?:[.,](\d*))?$/.exec(input.trim());
	if (!match) return null;
	const [, whole, fraction = ''] = match;
	if (fraction.length > digits) return null;
	const amount = Number(whole + fraction.padEnd(digits, '0'));
	return amount > 0 ? amount : null;
}

/** Minor units as a plain input value, e.g. 1250 → "12.50". */
export function amountInputValue(amount: number, currency: string): string {
	const digits = minorDigits(currency);
	if (digits === 0) return String(amount);
	const text = String(amount).padStart(digits + 1, '0');
	return `${text.slice(0, -digits)}.${text.slice(-digits)}`;
}

export function formatAmount(amount: number, currency: string, locale: string): string {
	return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
		amount / 10 ** minorDigits(currency)
	);
}

/** The currency's symbol in this language, e.g. "£", "$" or "CA$"; the code when there's none */
export function currencySymbol(currency: string, locale: string): string {
	try {
		const parts = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0);
		return parts.find((part) => part.type === 'currency')?.value ?? currency;
	} catch {
		return currency;
	}
}

/** For currency pickers: "£ British Pound", or "CHF Swiss Franc" where the code is the symbol */
export function currencyLabel(currency: string, locale: string): string {
	let name: string | undefined;
	try {
		name = new Intl.DisplayNames([locale], { type: 'currency' }).of(currency);
	} catch {
		name = undefined;
	}
	const symbol = currencySymbol(currency, locale);
	return name && name !== currency ? `${symbol} ${name}` : symbol;
}

/** Short, for chart axes: "€2K", "€500" */
export function formatCompact(amount: number, currency: string, locale: string): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		notation: 'compact',
		maximumFractionDigits: 0
	}).format(amount / 10 ** minorDigits(currency));
}

/**
 * Splits an amount equally. The remainder goes one unit each to the first
 * participants in the given order, so the shares always sum to the amount (E-5).
 */
export function splitEqual(amount: number, participantIds: readonly string[]) {
	const base = Math.floor(amount / participantIds.length);
	const remainder = amount - base * participantIds.length;
	return participantIds.map((memberId, i) => ({
		memberId,
		shareCents: base + (i < remainder ? 1 : 0)
	}));
}

export type BalanceInput = {
	paidBy: string;
	amountCents: number;
	/** When several people paid (#39); else paidBy paid it all */
	payers?: readonly Payer[] | null;
	splits: readonly { memberId: string; shareCents: number }[];
};

/** Net balance per member: positive = is owed money, negative = owes (B-1). */
export function balances(memberIds: readonly string[], expenses: readonly BalanceInput[]) {
	const result = new Map(memberIds.map((id) => [id, 0]));
	const add = (id: string, amount: number) => result.set(id, (result.get(id) ?? 0) + amount);
	for (const expense of expenses) {
		for (const payer of payersOf(expense)) add(payer.memberId, payer.amountCents);
		for (const split of expense.splits) add(split.memberId, -split.shareCents);
	}
	return result;
}

/** Adds up balances per currency; currencies are never mixed. Sorted by currency code. */
export function totalsByCurrency(items: readonly { currency: string; balance: number }[]) {
	const totals = new Map<string, number>();
	for (const { currency, balance } of items) {
		totals.set(currency, (totals.get(currency) ?? 0) + balance);
	}
	return [...totals]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([currency, amount]) => ({ currency, amount }));
}
