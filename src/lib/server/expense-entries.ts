// The expense list a page at a time (newest first), each entry with its category chosen
// or guessed. Used for the group page's first page and for loading older pages.
import { loadDataset } from '#lib/expense/dataset/load.ts';
import { categoryOf, learnCategories } from '#lib/expense/learned.ts';
import type { Db } from './db';
import { listChosenCategories, listEntryPage } from './expenses';

export async function entryPage(db: Db, groupId: string, offset: number, limit: number) {
	// One extra row tells whether there are more
	const [rows, chosen, dataset] = await Promise.all([
		listEntryPage(db, groupId, offset, limit + 1),
		listChosenCategories(db, groupId),
		loadDataset()
	]);
	const learned = learnCategories(chosen);
	return {
		entries: rows.slice(0, limit).map((row) => ({
			...row,
			category: row.type === 'expense' ? categoryOf(row, learned, dataset) : null
		})),
		hasMore: rows.length > limit
	};
}

export type ListEntry = Awaited<ReturnType<typeof entryPage>>['entries'][number];
