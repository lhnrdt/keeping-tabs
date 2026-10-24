// Highlights (#162): a few friendly facts about a group, only the ones its data makes true
// and worth telling. Most telling first, at most MAX_HIGHLIGHTS.
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import { normalizeTitle } from '#lib/expense/normalize.ts';
import type { Kind } from './expense-kinds';

type Expense = {
	id: string;
	title: string;
	amountCents: number;
	paidBy: string;
	date: string;
	category: ExpenseCategory;
};

export type Highlight =
	| { kind: 'topCategory'; category: ExpenseCategory; share: number }
	| { kind: 'busiestDay'; date: string; amount: number }
	| { kind: 'place'; title: string; times: number; amount: number }
	| { kind: 'mostOften'; memberId: string; times: number; count: number }
	| { kind: 'streak'; days: number; from: string }
	/** 0 = Monday … 6 = Sunday */
	| { kind: 'weekday'; weekday: number; share: number };

export const MAX_HIGHLIGHTS = 4;

/** A category worth naming: at least this share of everything, with others beside it, but
 * not so much that it's just what the group is for */
const TOP_CATEGORY_SHARE = 0.35;
const TOP_CATEGORY_OBVIOUS = 0.8;
/** A busiest day: at least this many times an average day with expenses */
const BUSIEST_FACTOR = 1.5;
/** A place (a title that isn't a fixed cost) used at least this often */
const PLACE_MIN_TIMES = 3;
/** Who pays most often: from this many expenses, at least half of them and clearly more
 * than a fair turn (this many times their part) */
const MOST_OFTEN_MIN_COUNT = 4;
const MOST_OFTEN_SHARE = 0.5;
const MOST_OFTEN_FAIR_FACTOR = 1.5;
/** A streak from this many days, when there were days without expenses besides */
const STREAK_MIN_DAYS = 4;
/** A favourite weekday: over at least three weeks and this many expenses, this share */
const WEEKDAY_MIN_DAYS = 21;
const WEEKDAY_MIN_COUNT = 8;
const WEEKDAY_SHARE = 0.3;

const DAY_MS = 24 * 60 * 60 * 1000;
const time = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();
const sum = (values: Iterable<number>) => [...values].reduce((total, value) => total + value, 0);

/** The key with the largest value, if it's the only one that large */
function leader<K>(totals: Map<K, number>): [K, number] | null {
	const sorted = [...totals].sort((a, b) => b[1] - a[1]);
	return sorted.length && (sorted.length === 1 || sorted[0][1] > sorted[1][1]) ? sorted[0] : null;
}

function totalsBy<K>(
	expenses: readonly Expense[],
	key: (expense: Expense) => K,
	value: (expense: Expense) => number = (expense) => expense.amountCents
) {
	const totals = new Map<K, number>();
	for (const expense of expenses) {
		const k = key(expense);
		totals.set(k, (totals.get(k) ?? 0) + value(expense));
	}
	return totals;
}

function topCategory(expenses: readonly Expense[], total: number): Highlight | null {
	const totals = totalsBy(expenses, (expense) => expense.category);
	const top = leader(totals);
	const share = top ? top[1] / total : 0;
	if (!top || totals.size < 2 || share < TOP_CATEGORY_SHARE || share >= TOP_CATEGORY_OBVIOUS)
		return null;
	return { kind: 'topCategory', category: top[0], share };
}

function busiestDay(expenses: readonly Expense[], total: number): Highlight | null {
	const totals = totalsBy(expenses, (expense) => expense.date);
	const top = leader(totals);
	if (!top || totals.size < 3 || top[1] < (total / totals.size) * BUSIEST_FACTOR) return null;
	return { kind: 'busiestDay', date: top[0], amount: top[1] };
}

function place(expenses: readonly Expense[], kinds: ReadonlyMap<string, Kind>): Highlight | null {
	const byTitle = Map.groupBy(
		expenses.filter((expense) => kinds.get(expense.id) !== 'fixed'),
		(expense) => normalizeTitle(expense.title)
	);
	const top = [...byTitle]
		.filter(([key, group]) => key && group.length >= PLACE_MIN_TIMES)
		.map(([, group]) => group)
		.sort(
			(a, b) =>
				b.length - a.length || sum(b.map((e) => e.amountCents)) - sum(a.map((e) => e.amountCents))
		)[0];
	if (!top) return null;
	const latest = top.toSorted((a, b) => a.date.localeCompare(b.date)).at(-1)!;
	return {
		kind: 'place',
		title: latest.title,
		times: top.length,
		amount: sum(top.map((expense) => expense.amountCents))
	};
}

function mostOften(expenses: readonly Expense[], memberCount: number): Highlight | null {
	if (memberCount < 2 || expenses.length < MOST_OFTEN_MIN_COUNT) return null;
	const top = leader(
		totalsBy(
			expenses,
			(expense) => expense.paidBy,
			() => 1
		)
	);
	const fair = Math.max(MOST_OFTEN_SHARE, MOST_OFTEN_FAIR_FACTOR / memberCount);
	if (!top || top[1] / expenses.length < fair) return null;
	return { kind: 'mostOften', memberId: top[0], times: top[1], count: expenses.length };
}

function streak(expenses: readonly Expense[]): Highlight | null {
	const days = [...new Set(expenses.map((expense) => expense.date))].sort();
	let best = { days: 0, from: '' };
	let run = { days: 0, from: '' };
	days.forEach((day, i) => {
		run =
			i > 0 && time(day) - time(days[i - 1]) === DAY_MS
				? { ...run, days: run.days + 1 }
				: { days: 1, from: day };
		if (run.days > best.days) best = run;
	});
	return best.days >= STREAK_MIN_DAYS && best.days < days.length
		? { kind: 'streak', ...best }
		: null;
}

function weekday(expenses: readonly Expense[], total: number): Highlight | null {
	const dates = expenses.map((expense) => time(expense.date));
	const span = (Math.max(...dates) - Math.min(...dates)) / DAY_MS;
	if (expenses.length < WEEKDAY_MIN_COUNT || span < WEEKDAY_MIN_DAYS) return null;
	const top = leader(
		totalsBy(expenses, (expense) => (new Date(time(expense.date)).getUTCDay() + 6) % 7)
	);
	if (!top || top[1] / total < WEEKDAY_SHARE) return null;
	return { kind: 'weekday', weekday: top[0], share: top[1] / total };
}

export function highlightsOf(
	expenses: readonly Expense[],
	kinds: ReadonlyMap<string, Kind>,
	memberCount: number
): Highlight[] {
	const total = sum(expenses.map((expense) => expense.amountCents));
	if (total <= 0) return [];
	return [
		topCategory(expenses, total),
		busiestDay(expenses, total),
		place(expenses, kinds),
		mostOften(expenses, memberCount),
		streak(expenses),
		weekday(expenses, total)
	]
		.filter((highlight) => highlight !== null)
		.slice(0, MAX_HIGHLIGHTS);
}
