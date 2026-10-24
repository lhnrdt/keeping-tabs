// "Ben owes you €30.00" / "You owe Ben €10.00": what's open with someone in a group, in words
// (group header, start screen).
import { formatAmount } from '#lib/money.ts';
import { m } from '#lib/paraglide/messages.js';
import { getLocale } from '#lib/paraglide/runtime.js';

/** `amount` positive: they owe you; negative: you owe them */
export function openLine(name: string, amount: number, currency: string) {
	const money = formatAmount(Math.abs(amount), currency, getLocale());
	return amount > 0
		? m.hero_owes_you({ name, amount: money })
		: m.hero_you_owe({ name, amount: money });
}
