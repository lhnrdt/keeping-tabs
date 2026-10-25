// Each month by kind of cost (#169): fixed, everyday, occasional and big one-offs stacked,
// for groups that run month by month (a home, a car): what the fixed costs leave and what
// came on top.
import { KINDS, type Kind } from './expense-kinds';

type Expense = { id: string; amountCents: number; date: string };

export type KindMonth = { month: string } & Record<Kind, number>;

const monthOf = (date: string) => `${date.slice(0, 7)}-01`;

function nextMonth(month: string) {
	const date = new Date(`${month}T00:00:00Z`);
	date.setUTCMonth(date.getUTCMonth() + 1);
	return date.toISOString().slice(0, 10);
}

/** Every month from the first to the last (or over the whole range), empty ones included */
export function kindsByMonth(
	expenses: readonly Expense[],
	kinds: ReadonlyMap<string, Kind>,
	range: { from: string; to: string } | null = null
): KindMonth[] {
	if (expenses.length === 0) return [];
	const sums = new Map<string, Record<Kind, number>>();
	for (const expense of expenses) {
		const month = monthOf(expense.date);
		const row = sums.get(month) ?? { fixed: 0, everyday: 0, occasional: 0, big: 0 };
		row[kinds.get(expense.id) ?? 'occasional'] += expense.amountCents;
		sums.set(month, row);
	}
	const months = [...sums.keys()].sort();
	const first = range ? monthOf(range.from) : months[0];
	const last = range ? monthOf(range.to) : months.at(-1)!;
	const result: KindMonth[] = [];
	for (let month = first; month <= last; month = nextMonth(month)) {
		const row = sums.get(month);
		result.push({
			month,
			...Object.fromEntries(KINDS.map((kind) => [kind, row?.[kind] ?? 0]))
		} as KindMonth);
	}
	return result;
}
