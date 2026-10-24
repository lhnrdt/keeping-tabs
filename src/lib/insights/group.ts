// Insights for a group's entries (#161): each expense in its category as the app shows it,
// chosen by hand or guessed from its title the way the group taught it.
import { learnCategories, categoryOf } from '#lib/expense/learned.ts';
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import type { Transfer } from '#lib/settle.ts';
import { budgetOf } from './budget';
import { insightsOf, type InsightEntry } from './insights';

type Entry = Omit<InsightEntry, 'category'> & { category: ExpenseCategory | null };

/** `entries` newest first, as listExpenses returns them; `you` is your member, if any */
export function groupInsights(
	entries: readonly Entry[],
	memberIds: readonly string[],
	you: string | null,
	transfers: readonly Transfer[],
	/** The group's budget and end date (#168), and today as YYYY-MM-DD */
	plan: { budget: number | null; endsOn: string | null },
	today: string
) {
	const learned = learnCategories(entries);
	return {
		...insightsOf(
			entries.map((entry) => ({ ...entry, category: categoryOf(entry, learned) })),
			memberIds,
			you,
			transfers
		),
		budget: budgetOf(
			entries.filter((entry) => entry.type === 'expense'),
			plan,
			today
		)
	};
}

export type GroupInsights = ReturnType<typeof groupInsights>;
