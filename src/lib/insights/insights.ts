// A group's insights (#161): the numbers behind the Insights tab, from its entries. Spending
// means expenses only; payments move money between people and aren't spent.
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import type { Transfer } from '#lib/settle.ts';
import { fixedCosts, kindsOf, KINDS, type FixedCost, type Kind } from './expense-kinds';
import { highlightsOf, type Highlight } from './highlights';
import { seriesCategories, slicesOf, type Slice } from './category-slices';
import { inRange, type DateRange } from './period';
import { owingSince, paidBack, positionOverTime, type Point } from './standing';

export type InsightEntry = {
	id: string;
	type: 'expense' | 'payment';
	title: string;
	amountCents: number;
	paidBy: string;
	/** ISO date, YYYY-MM-DD */
	date: string;
	category: ExpenseCategory;
	splits: readonly { memberId: string; shareCents: number }[];
};

export type Unit = 'day' | 'week' | 'month';
export type Bucket = { start: string; amount: number };
export type CategoryShare = { category: ExpenseCategory | 'rest'; amount: number; share: number };
export type MemberSpend = { memberId: string; paid: number; share: number; times: number };
export type BigExpense = {
	id: string;
	title: string;
	date: string;
	paidBy: string;
	amount: number;
};
export type KindShare = { kind: Kind; amount: number; share: number };
export type OpenDebt = Transfer & { since: string | null };
export type Settling = { paidBack: number; open: number; debts: OpenDebt[] };

export type Insights = {
	total: number;
	count: number;
	perPerson: number;
	/** Your share of everything, when you're a member */
	myShare: number | null;
	/** Over the days from the first to the last expense */
	perDay: number;
	first: string | null;
	last: string | null;
	days: number;
	overTime: {
		unit: Unit;
		buckets: Bucket[];
		/** The same without big one-offs, when there are any (#167) */
		withoutBig: Bucket[] | null;
	};
	/** This period against the one before; for all of it, the latest week or month */
	change: { current: number; previous: number; against: 'day' | Unit | 'year' } | null;
	byCategory: CategoryShare[];
	/** The period by category for the donut (#183): the group's largest categories keep
	 * their colour in every period, the others are the rest */
	donut: { series: ExpenseCategory[]; slices: Slice[] };
	/** Fixed, everyday, occasional, big: how much of each (#167) */
	byKind: KindShare[];
	/** The recurring costs, largest first (#167) */
	fixed: FixedCost[];
	/** What the recurring costs come to in a month */
	fixedPerMonth: number;
	/** The largest expenses that aren't fixed costs */
	biggest: BigExpense[];
	/** Your balance over time, when you're a member (#166) */
	position: Point[] | null;
	/** Paid back so far, still open, and the open payments with how long they've been owed */
	settling: Settling;
	/** Paid, share and how often each member paid, in member order */
	byMember: MemberSpend[];
	/** A few friendly facts, when the data makes them true (#162) */
	highlights: Highlight[];
};

/** Categories shown on their own; the smaller rest is summed up */
export const MAX_CATEGORIES = 6;
export const MAX_BIGGEST = 5;

const DAY_MS = 24 * 60 * 60 * 1000;
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (date: Date) => date.toISOString().slice(0, 10);

/** The finest unit that keeps the chart readable: days for a month, weeks for a quarter */
export function unitFor(days: number): Unit {
	if (days <= 31) return 'day';
	if (days <= 90) return 'week';
	return 'month';
}

/** Start of the day, week (Monday) or month an ISO date falls in */
export function bucketStart(iso: string, unit: Unit): string {
	const date = toDate(iso);
	if (unit === 'week') date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
	if (unit === 'month') date.setUTCDate(1);
	return toIso(date);
}

function nextStart(iso: string, unit: Unit): string {
	const date = toDate(iso);
	if (unit === 'day') date.setUTCDate(date.getUTCDate() + 1);
	if (unit === 'week') date.setUTCDate(date.getUTCDate() + 7);
	if (unit === 'month') date.setUTCMonth(date.getUTCMonth() + 1);
	return toIso(date);
}

/** Every bucket from the first to the last expense (or over the whole range), empty ones included */
export function overTime(
	expenses: readonly InsightEntry[],
	unit: Unit,
	range: DateRange | null = null
): Bucket[] {
	if (expenses.length === 0) return [];
	const sums = new Map<string, number>();
	for (const { date, amountCents } of expenses) {
		const start = bucketStart(date, unit);
		sums.set(start, (sums.get(start) ?? 0) + amountCents);
	}
	const starts = [...sums.keys()].sort();
	const first = range ? bucketStart(range.from, unit) : starts[0];
	const last = range ? bucketStart(range.to, unit) : starts.at(-1)!;
	const buckets: Bucket[] = [];
	for (let start = first; start <= last; start = nextStart(start, unit)) {
		buckets.push({ start, amount: sums.get(start) ?? 0 });
	}
	return buckets;
}

/** Largest first; past MAX_CATEGORIES, the rest is one "rest" row at the end */
export function byCategory(expenses: readonly InsightEntry[], total: number): CategoryShare[] {
	const sums = new Map<ExpenseCategory, number>();
	for (const { category, amountCents } of expenses) {
		sums.set(category, (sums.get(category) ?? 0) + amountCents);
	}
	const sorted = [...sums].sort((a, b) => b[1] - a[1]);
	const shown = sorted.length > MAX_CATEGORIES ? sorted.slice(0, MAX_CATEGORIES - 1) : sorted;
	const restAmount = sorted.slice(shown.length).reduce((sum, [, amount]) => sum + amount, 0);
	const rows: CategoryShare[] = shown.map(([category, amount]) => ({
		category,
		amount,
		share: amount / total
	}));
	if (restAmount > 0)
		rows.push({ category: 'rest', amount: restAmount, share: restAmount / total });
	return rows;
}

/** What each member paid for expenses, their share of them, and how often they paid */
export function byMember(expenses: readonly InsightEntry[], memberIds: readonly string[]) {
	const rows = new Map<string, MemberSpend>(
		memberIds.map((memberId) => [memberId, { memberId, paid: 0, share: 0, times: 0 }])
	);
	for (const { paidBy, amountCents, splits } of expenses) {
		const payer = rows.get(paidBy);
		if (payer) {
			payer.paid += amountCents;
			payer.times += 1;
		}
		for (const { memberId, shareCents } of splits) {
			const row = rows.get(memberId);
			if (row) row.share += shareCents;
		}
	}
	return [...rows.values()];
}

/** A period against the one before; for all of it, the latest week or month against the one before */
function changeOf(
	range: DateRange | null,
	previous: number | null,
	total: number,
	buckets: readonly Bucket[],
	unit: Unit
): Insights['change'] {
	if (range && previous !== null) {
		const days =
			Math.round((toDate(range.to).getTime() - toDate(range.from).getTime()) / DAY_MS) + 1;
		const against = days === 1 ? 'day' : days <= 31 ? 'month' : 'year';
		return { current: total, previous, against };
	}
	if (range || unit === 'day' || buckets.length < 2) return null;
	return { current: buckets.at(-1)!.amount, previous: buckets.at(-2)!.amount, against: unit };
}

export function insightsOf(
	entries: readonly InsightEntry[],
	memberIds: readonly string[],
	you: string | null,
	/** The group's settle-up payments (as on the balances tab) */
	transfers: readonly Transfer[] = [],
	/**
	 * The period to sum up (#184), the one before it for the change, and its chart columns.
	 * What needs the whole history (fixed costs, kinds of costs, colours, your position,
	 * settling up) still looks at everything.
	 */
	period: { range?: DateRange | null; previous?: DateRange | null; unit?: Unit | null } = {}
): Insights {
	const everything = entries.filter((entry) => entry.type === 'expense');
	const range = period.range ?? null;
	const expenses = everything.filter((expense) => inRange(expense.date, range));
	const total = expenses.reduce((sum, { amountCents }) => sum + amountCents, 0);
	const dates = expenses.map(({ date }) => date).sort();
	const first = dates[0] ?? null;
	const last = dates.at(-1) ?? null;
	const days =
		first && last ? Math.round((toDate(last).getTime() - toDate(first).getTime()) / DAY_MS) + 1 : 0;
	const unit = period.unit ?? unitFor(days);
	const buckets = overTime(expenses, unit, range);
	const members = byMember(expenses, memberIds);
	const kinds = kindsOf(everything);
	const fixed = fixedCosts(everything);
	const kindAmounts = new Map<Kind, number>();
	for (const expense of expenses) {
		const kind = kinds.get(expense.id)!;
		kindAmounts.set(kind, (kindAmounts.get(kind) ?? 0) + expense.amountCents);
	}
	const categories = total > 0 ? byCategory(expenses, total) : [];
	const everythingTotal = everything.reduce((sum, { amountCents }) => sum + amountCents, 0);
	const series = seriesCategories(
		everythingTotal > 0 ? byCategory(everything, everythingTotal) : []
	);
	const previous = period.previous
		? everything
				.filter((expense) => inRange(expense.date, period.previous!))
				.reduce((sum, { amountCents }) => sum + amountCents, 0)
		: null;
	const withoutBig = expenses.filter((expense) => kinds.get(expense.id) !== 'big');
	return {
		total,
		count: expenses.length,
		perPerson: memberIds.length > 0 ? Math.round(total / memberIds.length) : 0,
		myShare: members.find((row) => row.memberId === you)?.share ?? null,
		perDay: days > 0 ? Math.round(total / days) : 0,
		first,
		last,
		days,
		overTime: {
			unit,
			buckets,
			withoutBig: withoutBig.length < expenses.length ? overTime(withoutBig, unit, range) : null
		},
		change: changeOf(range, previous, total, buckets, unit),
		byCategory: categories,
		donut: { series, slices: slicesOf(expenses, series) },
		byKind: KINDS.filter((kind) => kindAmounts.has(kind)).map((kind) => ({
			kind,
			amount: kindAmounts.get(kind)!,
			share: kindAmounts.get(kind)! / total
		})),
		fixed,
		fixedPerMonth: fixed.reduce((sum, cost) => sum + cost.average, 0),
		biggest: expenses
			.filter((expense) => kinds.get(expense.id) !== 'fixed')
			.toSorted((a, b) => b.amountCents - a.amountCents)
			.slice(0, MAX_BIGGEST)
			.map(({ id, title, date, paidBy, amountCents }) => ({
				id,
				title,
				date,
				paidBy,
				amount: amountCents
			})),
		position: you ? positionOverTime(entries, you) : null,
		settling: {
			paidBack: paidBack(entries),
			open: transfers.reduce((sum, transfer) => sum + transfer.amountCents, 0),
			debts: transfers.map((transfer) => ({
				...transfer,
				since: owingSince(entries, transfer.from)
			}))
		},
		byMember: members,
		highlights: highlightsOf(expenses, kinds, memberIds.length)
	};
}
