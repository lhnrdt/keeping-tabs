// The expense list in stretches (#47): expenses that follow each other share a card, and each payment
// stands on its own between them, since it's money changing hands and not something bought.
export function entryRuns<T extends { type: string }>(entries: readonly T[]) {
	const runs: T[][] = [];
	for (const entry of entries) {
		const last = runs.at(-1);
		if (last && entry.type !== 'payment' && last[0].type !== 'payment') last.push(entry);
		else runs.push([entry]);
	}
	return runs;
}
