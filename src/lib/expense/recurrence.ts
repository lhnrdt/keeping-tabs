// When a repeating expense comes again (#45): every week, month or year from its first date.
// Months keep their day, clamped to shorter months (the 31st → the 30th, Feb 28th), without
// drifting: each date is worked out from the first, not from the one before.

export const FREQUENCIES = ['weekly', 'monthly', 'yearly'] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const isFrequency = (value: unknown): value is Frequency =>
	FREQUENCIES.includes(value as Frequency);

const toIso = (date: Date) => date.toISOString().slice(0, 10);

/** The date of the n-th time (0 = the first date itself) */
export function occurrence(first: string, frequency: Frequency, n: number): string {
	const [year, month, day] = first.split('-').map(Number);
	if (frequency === 'weekly') {
		return toIso(new Date(Date.UTC(year, month - 1, day + 7 * n)));
	}
	const months = frequency === 'monthly' ? n : 12 * n;
	const target = new Date(Date.UTC(year, month - 1 + months, 1));
	const lastDay = new Date(
		Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
	).getUTCDate();
	target.setUTCDate(Math.min(day, lastDay));
	return toIso(target);
}

/** Which times are due by today, from the next one on: their numbers */
export function dueTimes(first: string, frequency: Frequency, next: number, today: string) {
	const due: number[] = [];
	for (let n = next; occurrence(first, frequency, n) <= today; n++) due.push(n);
	return due;
}
