// Categories per month (#183): what each month's spending went on, for the donut. The
// group's largest categories keep their place (and colour) in every month; the others are
// "rest", so switching months never repaints a category.
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '#lib/expense/categories.ts';
import { bucketStart, type CategoryShare } from './insights';

type Expense = { amountCents: number; date: string; category: ExpenseCategory };

export type MonthSlice = { category: ExpenseCategory | 'rest'; amount: number };
export type MonthCategories = {
	/** First day of the month, YYYY-MM-01 */
	month: string;
	total: number;
	/** In the categories' fixed order, then the rest; empty ones left out */
	slices: MonthSlice[];
};

/** Categories with a colour of their own; the chart palette has five */
export const MAX_SERIES = 5;

/** The group's largest categories, in the categories' fixed order (their colour slots) */
export function seriesCategories(byCategory: readonly CategoryShare[]): ExpenseCategory[] {
	const largest = byCategory
		.map((row) => row.category)
		.filter((category) => category !== 'rest')
		.slice(0, MAX_SERIES);
	return EXPENSE_CATEGORIES.filter((category) => largest.includes(category));
}

/** Every month from the first expense to the last, oldest first, empty ones included */
export function categoriesByMonth(
	expenses: readonly Expense[],
	series: readonly ExpenseCategory[]
): MonthCategories[] {
	if (expenses.length === 0) return [];
	const sums = new Map<string, Map<MonthSlice['category'], number>>();
	for (const { date, amountCents, category } of expenses) {
		const month = bucketStart(date, 'month');
		const slot = series.includes(category) ? category : 'rest';
		const slices = sums.get(month) ?? new Map();
		slices.set(slot, (slices.get(slot) ?? 0) + amountCents);
		sums.set(month, slices);
	}
	const months = [...sums.keys()].sort();
	const result: MonthCategories[] = [];
	for (let month = months[0]; month <= months.at(-1)!; month = nextMonth(month)) {
		const slices = sums.get(month) ?? new Map();
		const ordered = [...series, 'rest' as const]
			.filter((category) => slices.has(category))
			.map((category) => ({ category, amount: slices.get(category)! }));
		result.push({
			month,
			total: ordered.reduce((sum, slice) => sum + slice.amount, 0),
			slices: ordered
		});
	}
	return result;
}

function nextMonth(month: string) {
	const date = new Date(`${month}T00:00:00Z`);
	date.setUTCMonth(date.getUTCMonth() + 1);
	return date.toISOString().slice(0, 10);
}
