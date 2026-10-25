// The expense list a page at a time (newest first), each entry with its category chosen
// or guessed and your side of it (SP-19). Used for the group page's first page and for
// loading older pages.
import { loadDataset } from '#lib/expense/dataset/load.ts';
import { categoryOf, learnCategories } from '#lib/expense/learned.ts';
import { yourSide } from '#lib/expense/your-side.ts';
import type { Db } from './db';
import { listChosenCategories, listEntryPage, listSharesOf } from './expenses';

/** `me`: the viewer's member id, for their side of each expense; null if they haven't joined. */
export async function entryPage(
	db: Db,
	groupId: string,
	me: string | null,
	offset: number,
	limit: number,
	/** Only the expenses matching this (#68) */
	query = ''
) {
	// One extra row tells whether there are more
	const [rows, chosen, dataset] = await Promise.all([
		listEntryPage(db, groupId, offset, limit + 1, query),
		listChosenCategories(db, groupId),
		loadDataset()
	]);
	const learned = learnCategories(chosen);
	const page = rows.slice(0, limit);
	const myShares = me
		? await listSharesOf(
				db,
				page.filter((row) => row.type === 'expense').map((row) => row.id),
				me
			)
		: new Map<string, number>();
	return {
		entries: page.map((row) => ({
			...row,
			category: row.type === 'expense' ? categoryOf(row, learned, dataset) : null,
			// Payments are shown as they are ("Ben paid Anna"), only expenses get a side
			yourSide: row.type === 'expense' ? yourSide(row, me, myShares.get(row.id) ?? 0) : null
		})),
		hasMore: rows.length > limit
	};
}

export type ListEntry = Awaited<ReturnType<typeof entryPage>>['entries'][number];
