// Amounts as this person wants to see them (#238): in their display currency at today's rate,
// else in the group's. Only for showing: what's typed, owed and paid stays in the group's
// currency, and so do texts sent to others. Without a rate, the group's currency it is.
import { page } from '$app/state';
import { convert } from '#lib/expense/exchange.ts';
import { formatAmount, formatCompact } from '#lib/money.ts';
import { getLocale } from '#lib/paraglide/runtime.js';

type Money = { amount: number; currency: string };

function shown({ amount, currency }: Money): Money {
	const display: string | null = page.data.displayCurrency ?? null;
	const rate: string | undefined = page.data.displayRates?.[currency];
	if (!display || display === currency || !rate) return { amount, currency };
	const sign = amount < 0 ? -1 : 1;
	const cents = convert({ currency, amountCents: Math.abs(amount), rate }, display);
	return { amount: sign * cents, currency: display };
}

export function shownAmount(amount: number, currency: string) {
	const money = shown({ amount, currency });
	return formatAmount(money.amount, money.currency, getLocale());
}

export function shownCompact(amount: number, currency: string) {
	const money = shown({ amount, currency });
	return formatCompact(money.amount, money.currency, getLocale());
}

/** Totals per currency, added up where they now show in one */
export function shownTotals(totals: readonly Money[]): Money[] {
	const sums = new Map<string, number>();
	for (const total of totals) {
		const money = shown(total);
		sums.set(money.currency, (sums.get(money.currency) ?? 0) + money.amount);
	}
	return [...sums].map(([currency, amount]) => ({ currency, amount }));
}
