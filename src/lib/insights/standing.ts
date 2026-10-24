// Where people stand over time (#166): your running balance in a group, how long someone has
// owed, and how much has been paid back. Payments count like in the balances: the sender is
// owed what they paid, the recipient's split takes it.

type Entry = {
	type: 'expense' | 'payment';
	amountCents: number;
	paidBy: string;
	/** ISO date, YYYY-MM-DD */
	date: string;
	splits: readonly { memberId: string; shareCents: number }[];
};

export type Point = { date: string; balance: number };

/** How an entry changes a member's balance: what they paid minus their share */
function effect(entry: Entry, memberId: string) {
	const paid = entry.paidBy === memberId ? entry.amountCents : 0;
	const share = entry.splits.find((split) => split.memberId === memberId)?.shareCents ?? 0;
	return paid - share;
}

const byDate = (entries: readonly Entry[]) =>
	entries.toSorted((a, b) => a.date.localeCompare(b.date));

/** A member's balance at the end of each day with entries, oldest first */
export function positionOverTime(entries: readonly Entry[], memberId: string): Point[] {
	const points: Point[] = [];
	let balance = 0;
	for (const entry of byDate(entries)) {
		balance += effect(entry, memberId);
		if (points.at(-1)?.date === entry.date) points.at(-1)!.balance = balance;
		else points.push({ date: entry.date, balance });
	}
	return points;
}

/**
 * Since when a member has owed without a break: the first day of the run of days on which
 * their balance has been below zero up to now. null when they don't owe.
 */
export function owingSince(entries: readonly Entry[], memberId: string): string | null {
	let since: string | null = null;
	for (const { date, balance } of positionOverTime(entries, memberId)) {
		if (balance < 0) since ??= date;
		else since = null;
	}
	return since;
}

/** Everything paid back with payments so far */
export const paidBack = (entries: readonly Entry[]) =>
	entries
		.filter((entry) => entry.type === 'payment')
		.reduce((sum, entry) => sum + entry.amountCents, 0);
