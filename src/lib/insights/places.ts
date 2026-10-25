// Favourite places (#169): titles used again and again (the café, the supermarket, the
// petrol station), most often first. Fixed costs recur too but aren't places.
import { normalizeTitle } from '#lib/expense/normalize.ts';
import type { Kind } from './expense-kinds';

type Expense = { id: string; title: string; amountCents: number; date: string };

export type Place = { title: string; times: number; amount: number };

/** A place is a title used at least this often */
export const PLACE_MIN_TIMES = 3;
export const MAX_PLACES = 5;

/** Most often first, then the most spent; each under its title as last written */
export function placesOf(expenses: readonly Expense[], kinds: ReadonlyMap<string, Kind>): Place[] {
	const byTitle = Map.groupBy(
		expenses.filter((expense) => kinds.get(expense.id) !== 'fixed'),
		(expense) => normalizeTitle(expense.title)
	);
	return [...byTitle]
		.filter(([key, group]) => key && group.length >= PLACE_MIN_TIMES)
		.map(([, group]) => ({
			title: group.toSorted((a, b) => a.date.localeCompare(b.date)).at(-1)!.title,
			times: group.length,
			amount: group.reduce((sum, expense) => sum + expense.amountCents, 0)
		}))
		.sort((a, b) => b.times - a.times || b.amount - a.amount);
}
