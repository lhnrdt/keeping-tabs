// What kind of cost each expense is (#167): fixed (recurring), everyday (small, frequent),
// occasional, or a big one-off. Derived from the group's own expenses, nothing to set up.
import { normalizeTitle } from '#lib/expense/normalize.ts';

export const KINDS = ['fixed', 'everyday', 'occasional', 'big'] as const;
export type Kind = (typeof KINDS)[number];

type Expense = { id: string; title: string; amountCents: number; date: string };

/** Fixed: the same title in at least this many different months… */
const FIXED_MIN_MONTHS = 3;
/** …at amounts within this much of their median */
const FIXED_TOLERANCE = 0.25;
/** Big one-off: at least this many times the group's median expense */
const BIG_FACTOR = 3;
/** Everyday: at most this many times the median */
const EVERYDAY_FACTOR = 2;

export type FixedCost = {
	/** The title as last used */
	title: string;
	/** Per month, oldest first: the amount that month (0 when it didn't occur) */
	months: { month: string; amount: number }[];
	/** Average over the months it occurred */
	average: number;
	latest: number;
	/** The latest amount against the one before, if there is one */
	previous: number | null;
};

const median = (values: readonly number[]) => {
	if (values.length === 0) return 0;
	const sorted = values.toSorted((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const monthOf = (date: string) => date.slice(0, 7);

/** Titles that recur monthly at a steady amount, with their expenses (oldest first) */
function recurring(expenses: readonly Expense[]) {
	const byTitle = Map.groupBy(expenses, (expense) => normalizeTitle(expense.title));
	const fixed = new Map<string, Expense[]>();
	for (const [key, group] of byTitle) {
		if (!key) continue;
		const months = new Set(group.map((expense) => monthOf(expense.date)));
		if (months.size < FIXED_MIN_MONTHS) continue;
		// About once a month, not a dozen times
		if (group.length > months.size * 1.5) continue;
		const typical = median(group.map((expense) => expense.amountCents));
		const steady = group.every(
			(expense) => Math.abs(expense.amountCents - typical) <= typical * FIXED_TOLERANCE
		);
		if (steady)
			fixed.set(
				key,
				group.toSorted((a, b) => a.date.localeCompare(b.date))
			);
	}
	return fixed;
}

/** Each expense's kind, by id */
export function kindsOf(expenses: readonly Expense[]): Map<string, Kind> {
	const fixed = recurring(expenses);
	const fixedIds = new Set([...fixed.values()].flat().map((expense) => expense.id));
	const typical = median(expenses.map((expense) => expense.amountCents));
	return new Map(
		expenses.map((expense) => {
			if (fixedIds.has(expense.id)) return [expense.id, 'fixed'];
			if (expense.amountCents >= typical * BIG_FACTOR) return [expense.id, 'big'];
			if (expense.amountCents <= typical * EVERYDAY_FACTOR) return [expense.id, 'everyday'];
			return [expense.id, 'occasional'];
		})
	);
}

/** The recurring costs, largest first, each with its months from first to last */
export function fixedCosts(expenses: readonly Expense[]): FixedCost[] {
	const costs: FixedCost[] = [];
	for (const group of recurring(expenses).values()) {
		const sums = new Map<string, number>();
		for (const expense of group) {
			const month = monthOf(expense.date);
			sums.set(month, (sums.get(month) ?? 0) + expense.amountCents);
		}
		const first = monthOf(group[0].date);
		const last = monthOf(group.at(-1)!.date);
		const months: FixedCost['months'] = [];
		for (let month = first; month <= last; month = nextMonth(month)) {
			months.push({ month, amount: sums.get(month) ?? 0 });
		}
		const amounts = [...sums.values()];
		costs.push({
			title: group.at(-1)!.title,
			months,
			average: Math.round(amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length),
			latest: group.at(-1)!.amountCents,
			previous: group.length > 1 ? group.at(-2)!.amountCents : null
		});
	}
	return costs.sort((a, b) => b.average - a.average);
}

function nextMonth(month: string) {
	const [year, number] = month.split('-').map(Number);
	return number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, '0')}`;
}
