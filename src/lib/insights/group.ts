// Insights for a group's entries (#161): each expense in its category as the app shows it,
// chosen by hand or guessed from its title the way the group taught it.
import { learnCategories, categoryOf } from '#lib/expense/learned.ts';
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import type { Transfer } from '#lib/settle.ts';
import { budgetOf } from './budget';
import { insightsOf, type InsightEntry } from './insights';
import { periodRange, stepPeriod, unitFor, type DateRange, type Period } from './period';
import { recapOf } from './recap';

type Entry = Omit<InsightEntry, 'category'> & { category: ExpenseCategory | null };

/** `entries` newest first, as listExpenses returns them; `you` is your member, if any */
export function groupInsights(
	entries: readonly Entry[],
	memberIds: readonly string[],
	you: string | null,
	transfers: readonly Transfer[],
	/** The group's budget and end date (#168), and today as YYYY-MM-DD */
	plan: { budget: number | null; endsOn: string | null },
	today: string,
	/** The period to sum up (#184) */
	period: Period = { kind: 'all' }
) {
	const learned = learnCategories(entries);
	const categorized = entries.map((entry) => ({ ...entry, category: categoryOf(entry, learned) }));
	const insights = insightsOf(categorized, memberIds, you, transfers, {
		range: periodRange(period),
		previous: period.kind === 'all' ? null : periodRange(stepPeriod(period, -1)),
		unit: unitFor(period)
	});
	// The recap is about the whole group, whatever period is shown
	const whole =
		period.kind === 'all' ? insights : insightsOf(categorized, memberIds, you, transfers);
	return {
		...insights,
		period,
		/** From the first expense to the last, for stepping between periods */
		span: (whole.first && whole.last
			? { from: whole.first, to: whole.last }
			: null) satisfies DateRange | null,
		recap: recapOf(whole, plan.endsOn, today),
		budget: budgetOf(
			entries.filter((entry) => entry.type === 'expense'),
			plan,
			today
		)
	};
}

export type GroupInsights = ReturnType<typeof groupInsights>;
