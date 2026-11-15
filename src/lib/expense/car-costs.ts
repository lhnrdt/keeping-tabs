// What a car costs over time (#366): per km month by month, from everything spent so far over the
// km driven so far, which falls as the purchase and the yearly costs spread over more km; and what
// it costs a month on average. Each with or without its purchase, as the person likes.
import type { ExpenseCategory } from './categories';
import type { DateRange } from '#lib/insights/period.ts';
import { drivingOf, type Driving, type DrivingEntry } from './driving';

export type CarEntry = {
	date: string;
	amountCents: number;
	category: ExpenseCategory;
	odometerM?: number | null;
};

export type CostPerKm = { month: string; centsPerKm: number };
/** The car's numbers, from one set of entries */
export type CarView = { driving: Driving | null; perKm: CostPerKm[]; monthly: number | null };

const monthOf = (date: string) => date.slice(0, 7);

function nextMonth(month: string) {
	const [year, number] = month.split('-').map(Number);
	return number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, '0')}`;
}

/** From the first reading's month to the last's, what a km had cost by the end of each */
export function costPerKmOverTime(entries: readonly CarEntry[]): CostPerKm[] {
	const readings = entries
		.filter((entry) => entry.odometerM)
		.toSorted((a, b) => a.date.localeCompare(b.date) || a.odometerM! - b.odometerM!);
	if (readings.length < 2) return [];
	const start = readings[0].odometerM!;
	const points: CostPerKm[] = [];
	for (
		let month = monthOf(readings[0].date);
		month <= monthOf(readings.at(-1)!.date);
		month = nextMonth(month)
	) {
		const upTo = (entry: CarEntry) => monthOf(entry.date) <= month;
		const reached = Math.max(...readings.filter(upTo).map((entry) => entry.odometerM!));
		const drivenM = reached - start;
		if (drivenM <= 0) continue;
		const spent = entries.filter(upTo).reduce((sum, entry) => sum + entry.amountCents, 0);
		points.push({ month, centsPerKm: Math.round((spent * 1000) / drivenM) });
	}
	return points;
}

/** On average a month, from the first expense's month up to this one */
export function monthlyCost(entries: readonly CarEntry[], today: string): number | null {
	if (entries.length === 0) return null;
	const first = entries.map((entry) => monthOf(entry.date)).sort()[0];
	let months = 0;
	for (let month = first; month <= monthOf(today); month = nextMonth(month)) months++;
	const spent = entries.reduce((total, entry) => total + entry.amountCents, 0);
	return Math.round(spent / Math.max(1, months));
}

/** The same entries with the purchase costing nothing: its odometer reading still counts */
const withoutPurchase = <T extends CarEntry>(entries: readonly T[]) =>
	entries.map((entry) => (entry.category === 'purchase' ? { ...entry, amountCents: 0 } : entry));

const viewOf = (
	entries: readonly (CarEntry & DrivingEntry)[],
	range: DateRange | null,
	today: string
): CarView => ({
	driving: drivingOf(entries, range),
	perKm: costPerKmOverTime(entries),
	monthly: monthlyCost(entries, today)
});

/** With the purchase, and without it when there is one to leave out (else null) */
export function carViews(
	entries: readonly (CarEntry & DrivingEntry)[],
	range: DateRange | null,
	today: string
) {
	const bought = entries.some((entry) => entry.category === 'purchase');
	return {
		withPurchase: viewOf(entries, range, today),
		withoutPurchase: bought ? viewOf(withoutPurchase(entries), range, today) : null
	};
}

export type CarViews = ReturnType<typeof carViews>;
