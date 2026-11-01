// An encrypted group's entries on this device (#110, #277): what's new since last time goes on top
// of what's kept, so opening a group doesn't mean fetching all of it again.

export type KeptEntry = { id: string; date: string; createdAt: number };

export type EntriesAnswer<T extends KeptEntry> = {
	/** The server's time of this answer: next time, ask from there */
	asOf: number;
	/** All of them instead of what's changed: the group is still being encrypted */
	whole: boolean;
	rows: T[];
	removed: string[];
};

/** Newest first, as the rest of the app expects them */
export function mergeEntries<T extends KeptEntry>(kept: readonly T[], answer: EntriesAnswer<T>) {
	const rows = new Map(answer.whole ? [] : kept.map((row) => [row.id, row]));
	for (const id of answer.removed) rows.delete(id);
	for (const row of answer.rows) rows.set(row.id, row);
	return [...rows.values()].sort(
		(a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
	);
}
