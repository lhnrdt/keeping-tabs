/** The first item per id, keeping order (e.g. when pages overlap). */
export function uniqueById<T extends { id: string }>(items: readonly T[]): T[] {
	const seen = new Set<string>();
	return items.filter((item) => !seen.has(item.id) && seen.add(item.id));
}
