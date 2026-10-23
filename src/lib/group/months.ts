// The expense list by month (SP-20): entries are newest first, so each month is one run.

export type MonthGroup<T> = { month: string; entries: T[] };

/** Groups entries by their month ("2026-10"), keeping their order. */
export function groupByMonth<T extends { date: string }>(entries: readonly T[]): MonthGroup<T>[] {
	const groups: MonthGroup<T>[] = [];
	for (const entry of entries) {
		const month = entry.date.slice(0, 7);
		const last = groups.at(-1);
		if (last?.month === month) last.entries.push(entry);
		else groups.push({ month, entries: [entry] });
	}
	return groups;
}
