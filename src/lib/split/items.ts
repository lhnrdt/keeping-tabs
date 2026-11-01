// Splitting by receipt items (#53): each item is shared equally by whoever had it. What the items
// don't cover (tip, tax) is shared in proportion to what each had. Saved as exact shares; the
// items stay with the expense so it can be edited the same way.
import { isSealed } from '#lib/crypto/seal.ts';
import { parseAmount, splitEqual } from '#lib/money.ts';
import type { Result } from '#lib/validation.ts';
import { splitByWeight, type Share } from './compute';

/** The form's mode for this; everything else about the expense sees exact shares */
export const ITEMS_MODE = 'items';

const MAX_ITEMS = 100;
const MAX_NAME_LENGTH = 80;

/** Prices in minor units of the currency the amount was typed in */
export type ExpenseItem = { name: string; cents: number; memberIds: string[] };

/** As the form sends it: the price as typed */
export type TypedItem = { name: string; price: string; memberIds: string[] };

/** The form's field: a list of typed items as JSON */
export function parseItems(
	text: unknown,
	currency: string,
	memberIds: readonly string[]
): Result<ExpenseItem[]> {
	let raw: unknown;
	try {
		raw = JSON.parse(typeof text === 'string' ? text : '');
	} catch {
		return { ok: false, error: 'split_input_invalid' };
	}
	if (!Array.isArray(raw) || raw.length > MAX_ITEMS) {
		return { ok: false, error: 'split_input_invalid' };
	}
	const known = new Set(memberIds);
	const items: ExpenseItem[] = [];
	for (const entry of raw as Partial<TypedItem>[]) {
		const name = typeof entry?.name === 'string' ? entry.name.trim() : '';
		const cents =
			typeof entry?.price === 'string' ? parseAmount(entry.price.trim(), currency) : null;
		const chosen = Array.isArray(entry?.memberIds) ? entry.memberIds : [];
		if (
			name.length > (isSealed(name) ? MAX_NAME_LENGTH * 8 + 64 : MAX_NAME_LENGTH) ||
			cents === null
		) {
			return { ok: false, error: 'split_input_invalid' };
		}
		if (chosen.length === 0 || !chosen.every((id) => known.has(id))) {
			return { ok: false, error: 'split_item_nobody' };
		}
		items.push({ name, cents, memberIds: [...new Set(chosen)] });
	}
	return items.length ? { ok: true, value: items } : { ok: false, error: 'split_items_empty' };
}

export const itemsTotal = (items: readonly Pick<ExpenseItem, 'cents'>[]) =>
	items.reduce((sum, item) => sum + item.cents, 0);

/**
 * Each member's share of `amount` (in the group's currency), whatever the items' currency:
 * `typedTotal` is the amount in theirs, which they may not go over.
 */
export function itemShares(
	items: readonly ExpenseItem[],
	typedTotal: number,
	amount: number
): Result<Share[]> {
	if (itemsTotal(items) > typedTotal) return { ok: false, error: 'split_items_over' };
	const had = new Map<string, number>();
	for (const { cents, memberIds } of items) {
		for (const { memberId, shareCents } of splitEqual(cents, memberIds)) {
			had.set(memberId, (had.get(memberId) ?? 0) + shareCents);
		}
	}
	const entries = [...had].map(([memberId, input]) => ({ memberId, input }));
	return {
		ok: true,
		value: splitByWeight(amount, entries).map((share) => ({
			...share,
			input: share.shareCents
		}))
	};
}
