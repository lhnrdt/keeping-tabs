// A period's spending by category, for the donut (#183): the group's largest categories
// keep their place (and colour) in every period; the others are "rest", so moving to
// another period never repaints a category.
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '#lib/expense/categories.ts';
import type { CategoryShare } from './insights';

type Expense = { amountCents: number; category: ExpenseCategory };

export type Slice = { category: ExpenseCategory | 'rest'; amount: number };

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

/** In the series' order, then the rest; empty ones left out */
export function slicesOf(
	expenses: readonly Expense[],
	series: readonly ExpenseCategory[]
): Slice[] {
	const sums = new Map<Slice['category'], number>();
	for (const { amountCents, category } of expenses) {
		const slot = series.includes(category) ? category : 'rest';
		sums.set(slot, (sums.get(slot) ?? 0) + amountCents);
	}
	return [...series, 'rest' as const]
		.filter((category) => sums.has(category))
		.map((category) => ({ category, amount: sums.get(category)! }));
}
