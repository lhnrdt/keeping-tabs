// "Ben owes you €30.00" / "You owe Ben €10.00": what's open with someone in a group, in words
// (group header, start screen).
import { shownAmount } from '#lib/shown-money.ts';
import { m } from '#lib/paraglide/messages.js';

/** `amount` positive: they owe you; negative: you owe them */
export function openLine(name: string, amount: number, currency: string) {
	const money = shownAmount(Math.abs(amount), currency);
	return amount > 0
		? m.hero_owes_you({ name, amount: money })
		: m.hero_you_owe({ name, amount: money });
}
