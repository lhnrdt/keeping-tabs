// A recap for a finished group (#163): the trip or event in a few numbers, once it's over:
// past its end date, or quiet for a while without one.
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import type { Highlight } from './highlights';
import type { Insights } from './insights';

export type Recap = {
	from: string;
	to: string;
	days: number;
	total: number;
	count: number;
	perPerson: number;
	perDay: number;
	people: number;
	/** The largest category and its share, when there's more than one */
	topCategory: { category: ExpenseCategory; share: number } | null;
	/** The busiest day, when one stands out (#162) */
	busiestDay: { date: string; amount: number } | null;
};

/** Without an end date, a group is over after this many days without expenses */
export const RECAP_QUIET_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;
const time = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();

export function isFinished(last: string, endsOn: string | null, today: string) {
	if (endsOn) return endsOn < today;
	return (time(today) - time(last)) / DAY_MS >= RECAP_QUIET_DAYS;
}

export function recapOf(
	insights: Pick<
		Insights,
		| 'first'
		| 'last'
		| 'days'
		| 'total'
		| 'count'
		| 'perPerson'
		| 'perDay'
		| 'byCategory'
		| 'byMember'
		| 'highlights'
	>,
	endsOn: string | null,
	/** ISO date, YYYY-MM-DD */
	today: string
): Recap | null {
	const { first, last } = insights;
	if (!first || !last || !isFinished(last, endsOn, today)) return null;
	const [top] = insights.byCategory;
	const busiest = insights.highlights.find(
		(highlight): highlight is Extract<Highlight, { kind: 'busiestDay' }> =>
			highlight.kind === 'busiestDay'
	);
	return {
		from: first,
		to: last,
		days: insights.days,
		total: insights.total,
		count: insights.count,
		perPerson: insights.perPerson,
		perDay: insights.perDay,
		people: insights.byMember.length,
		topCategory:
			top && top.category !== 'rest' && insights.byCategory.length > 1
				? { category: top.category, share: top.share }
				: null,
		busiestDay: busiest ? { date: busiest.date, amount: busiest.amount } : null
	};
}
