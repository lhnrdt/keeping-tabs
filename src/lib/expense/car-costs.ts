// What a car costs over time (#366): per km month by month, from everything spent so far over the
// km driven so far, which falls as the purchase and the yearly costs spread over more km; and what
// it costs a month on average, with or without its purchase.
import type { ExpenseCategory } from './categories';

export type CarEntry = {
	date: string;
	amountCents: number;
	category: ExpenseCategory;
	odometerM?: number | null;
};

export type CostPerKm = { month: string; centsPerKm: number };
export type MonthlyCost = {
	/** Everything, the purchase included */
	all: number;
	/** Without the purchase */
	running: number;
	/** Whether there is a purchase to leave out */
	purchase: boolean;
};

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
export function monthlyCost(entries: readonly CarEntry[], today: string): MonthlyCost | null {
	if (entries.length === 0) return null;
	const first = entries.map((entry) => monthOf(entry.date)).sort()[0];
	let months = 0;
	for (let month = first; month <= monthOf(today); month = nextMonth(month)) months++;
	const sum = (rows: readonly CarEntry[]) =>
		rows.reduce((total, row) => total + row.amountCents, 0);
	const running = entries.filter((entry) => entry.category !== 'purchase');
	return {
		all: Math.round(sum(entries) / Math.max(1, months)),
		running: Math.round(sum(running) / Math.max(1, months)),
		purchase: running.length < entries.length
	};
}
