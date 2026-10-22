// Categories a group has chosen by hand teach the automatic guess: once "Netto run" is
// marked as groceries, later "Netto run" expenses are groceries too.
import type { ExpenseCategory } from './categories';
import { categorize } from './categorize';
import type { DatasetIndex } from './dataset/index';
import { normalizeTitle } from './normalize';

type Entry = { title: string; category: ExpenseCategory | null };

export type Learned = ReadonlyMap<string, ExpenseCategory>;

/** Hand-chosen category per title; pass expenses newest first so the latest choice wins. */
export function learnCategories(expenses: readonly Entry[]): Learned {
	const learned = new Map<string, ExpenseCategory>();
	for (const { title, category } of expenses) {
		const key = normalizeTitle(title);
		if (category && !learned.has(key)) learned.set(key, category);
	}
	return learned;
}

/** What "Automatic" means for a title: the group's own choice, else the keyword guess. */
export const guessCategory = (title: string, learned: Learned, dataset?: DatasetIndex) =>
	learned.get(normalizeTitle(title)) ?? categorize(title, dataset);

/** An expense's category: chosen by hand, else guessed. */
export const categoryOf = (expense: Entry, learned: Learned, dataset?: DatasetIndex) =>
	expense.category ?? guessCategory(expense.title, learned, dataset);
