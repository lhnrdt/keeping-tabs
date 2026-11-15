// What kind of cost each expense is (#167): fixed (rent, utilities, internet, insurance), everyday
// (small and frequent), occasional, or a big one-off. From what's certain about each expense, its
// category and its amount, never from its title: the same thing is written many ways ("Rewe",
// "Einkaufen", "Rwe"), and a typo mustn't change what an insight says.
import type { ExpenseCategory } from '#lib/expense/categories.ts';

export const KINDS = ['fixed', 'everyday', 'occasional', 'big'] as const;
export type Kind = (typeof KINDS)[number];

type Expense = { id: string; amountCents: number; date: string; category: ExpenseCategory };

/** What's paid regularly whatever it's called: these categories are fixed costs */
export const FIXED_CATEGORIES: ReadonlySet<ExpenseCategory> = new Set([
	'rent',
	'utilities',
	'internet',
	'insurance'
]);
/** Big one-off: at least this many times the group's median expense */
const BIG_FACTOR = 3;
/** Everyday: at most this many times the median */
const EVERYDAY_FACTOR = 2;

export type FixedCost = {
	category: ExpenseCategory;
	/** Per month, oldest first: the amount that month (0 when there was none) */
	months: { month: string; amount: number }[];
	/** What it comes to a month: each payment spread over the months until the next */
	average: number;
	/** How often it's paid, in months: the usual gap between payments, or a guess for one alone */
	everyMonths: number;
	/** The latest month's amount */
	latest: number;
	/** The month before's, if there was one */
	previous: number | null;
};

const median = (values: readonly number[]) => {
	if (values.length === 0) return 0;
	const sorted = values.toSorted((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const monthOf = (date: string) => date.slice(0, 7);

/** Paid once so far: insurance usually covers a year, the others a month */
const ONE_PAYMENT_COVERS: Partial<Record<ExpenseCategory, number>> = { insurance: 12 };

const monthIndex = (month: string) => {
	const [year, number] = month.split('-').map(Number);
	return year * 12 + number - 1;
};

/** The usual number of months between the months with a payment */
function usualGap(category: ExpenseCategory, paidMonths: readonly string[]) {
	if (paidMonths.length < 2) return ONE_PAYMENT_COVERS[category] ?? 1;
	const gaps = paidMonths.slice(1).map((month, i) => monthIndex(month) - monthIndex(paidMonths[i]));
	return Math.max(1, Math.round(median(gaps)));
}
const isFixed = (expense: Expense) => FIXED_CATEGORIES.has(expense.category);

/** Each expense's kind, by id */
export function kindsOf(expenses: readonly Expense[]): Map<string, Kind> {
	// What's typical among the rest: fixed costs like rent would make everything else look small
	const typical = median(expenses.filter((expense) => !isFixed(expense)).map((e) => e.amountCents));
	return new Map(
		expenses.map((expense) => {
			if (isFixed(expense)) return [expense.id, 'fixed'];
			if (expense.amountCents >= typical * BIG_FACTOR) return [expense.id, 'big'];
			if (expense.amountCents <= typical * EVERYDAY_FACTOR) return [expense.id, 'everyday'];
			return [expense.id, 'occasional'];
		})
	);
}

/** The fixed costs per category, largest first, each with its months from first to last */
export function fixedCosts(expenses: readonly Expense[]): FixedCost[] {
	const costs: FixedCost[] = [];
	for (const [category, group] of Map.groupBy(expenses.filter(isFixed), (e) => e.category)) {
		const sums = new Map<string, number>();
		for (const expense of group) {
			const month = monthOf(expense.date);
			sums.set(month, (sums.get(month) ?? 0) + expense.amountCents);
		}
		const sorted = [...sums.keys()].sort();
		const months: FixedCost['months'] = [];
		for (let month = sorted[0]; month <= sorted.at(-1)!; month = nextMonth(month)) {
			months.push({ month, amount: sums.get(month) ?? 0 });
		}
		const total = [...sums.values()].reduce((sum, amount) => sum + amount, 0);
		// Every 6 months, say: the last payment covers the 6 from its month on too
		const everyMonths = usualGap(category, sorted);
		const covered = months.length + everyMonths - 1;
		costs.push({
			category,
			months,
			average: Math.round(total / covered),
			everyMonths,
			latest: sums.get(sorted.at(-1)!)!,
			previous: sorted.length > 1 ? sums.get(sorted.at(-2)!)! : null
		});
	}
	return costs.sort((a, b) => b.average - a.average);
}

function nextMonth(month: string) {
	const [year, number] = month.split('-').map(Number);
	return number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, '0')}`;
}

/** The recurring costs within a period (#184): their months in it, those that occur there */
export function fixedCostsWithin(
	costs: readonly FixedCost[],
	range: { from: string; to: string } | null
) {
	if (!range) return [...costs];
	const [from, to] = [range.from.slice(0, 7), range.to.slice(0, 7)];
	return costs
		.map((cost) => ({
			...cost,
			months: cost.months.filter(({ month }) => month >= from && month <= to)
		}))
		.filter((cost) => cost.months.some(({ amount }) => amount > 0));
}
