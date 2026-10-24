// Budget and pace for trips and events (#168): spent so far against an optional budget, and
// where the pace so far leads by the end date. Either can be set without the other.

type Expense = { amountCents: number; date: string };

export type BudgetPoint = { date: string; spent: number };

export type BudgetView = {
	budget: number | null;
	endsOn: string | null;
	spent: number;
	/** Spent so far after each day with expenses, oldest first */
	points: BudgetPoint[];
	/** The first expense, and how far spending reaches: today, the end once it's past, or
	 * an expense booked ahead */
	from: string;
	upTo: string;
	/** What it comes to by the end date at the pace so far; null when the end isn't ahead */
	projected: number | null;
	/** Days from today to the end date, both included; null without one or once it's past */
	daysLeft: number | null;
	/** What's left of the budget per remaining day (0 once it's used up) */
	leftPerDay: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const time = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();
/** From one date to another; 0 when they're the same day */
const daysBetween = (from: string, to: string) => Math.round((time(to) - time(from)) / DAY_MS);

export function budgetOf(
	expenses: readonly Expense[],
	plan: { budget: number | null; endsOn: string | null },
	/** ISO date, YYYY-MM-DD */
	today: string
): BudgetView | null {
	const { budget, endsOn } = plan;
	if (budget === null && endsOn === null) return null;
	const sums = new Map<string, number>();
	for (const { date, amountCents } of expenses) sums.set(date, (sums.get(date) ?? 0) + amountCents);
	let spent = 0;
	const points = [...sums.keys()]
		.sort()
		.map((date) => ({ date, spent: (spent += sums.get(date)!) }));
	const from = points[0]?.date ?? today;
	const now = endsOn && endsOn < today ? endsOn : today;
	// Expenses dated ahead (booked already) count as spent by then
	const upTo = [now, points.at(-1)?.date ?? now].sort().at(-1)!;
	const ahead = endsOn ? daysBetween(upTo, endsOn) : 0;
	const daysLeft = endsOn && endsOn >= today ? daysBetween(today, endsOn) + 1 : null;
	return {
		budget,
		endsOn,
		spent,
		points,
		from,
		upTo,
		projected:
			ahead > 0 && spent > 0
				? Math.round(spent + (spent / (daysBetween(from, upTo) + 1)) * ahead)
				: null,
		daysLeft,
		leftPerDay:
			budget !== null && daysLeft ? Math.floor(Math.max(0, budget - spent) / daysLeft) : null
	};
}
