// The period a group's insights cover (#184): all of it, or one year, month or day. Kept in
// the address (?period=month&at=2026-10), so it survives a reload and can be shared.
import type { GroupKind } from '#lib/group/kinds.ts';
import type { Unit } from './insights';

export const PERIOD_KINDS = ['all', 'year', 'month', 'day'] as const;
export type PeriodKind = (typeof PERIOD_KINDS)[number];

/** `at`: 2026 for a year, 2026-10 for a month, 2026-10-24 for a day */
export type Period = { kind: 'all' } | { kind: Exclude<PeriodKind, 'all'>; at: string };

/** First and last day, both included */
export type DateRange = { from: string; to: string };

const PATTERNS = { year: /^\d{4}$/, month: /^\d{4}-\d{2}$/, day: /^\d{4}-\d{2}-\d{2}$/ } as const;

const isKind = (value: unknown): value is PeriodKind => PERIOD_KINDS.includes(value as PeriodKind);

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (date: Date) => date.toISOString().slice(0, 10);

/** Groups that run month by month start on this month; the others on all of it */
const MONTHLY: readonly GroupKind[] = ['home', 'partner', 'car'];

export const defaultPeriod = (kind: GroupKind, today: string): Period =>
	MONTHLY.includes(kind) ? { kind: 'month', at: today.slice(0, 7) } : { kind: 'all' };

/** The period in the address, else the group's default; nonsense falls back too */
export function parsePeriod(params: URLSearchParams, fallback: Period): Period {
	const kind = params.get('period');
	if (!isKind(kind)) return fallback;
	if (kind === 'all') return { kind };
	const at = params.get('at') ?? '';
	if (!PATTERNS[kind].test(at) || Number.isNaN(utc(rangeStart(kind, at)).getTime()))
		return fallback;
	return { kind, at };
}

function rangeStart(kind: Exclude<PeriodKind, 'all'>, at: string) {
	return kind === 'year' ? `${at}-01-01` : kind === 'month' ? `${at}-01` : at;
}

export function periodRange(period: Period): DateRange | null {
	if (period.kind === 'all') return null;
	const from = rangeStart(period.kind, period.at);
	const end = utc(from);
	if (period.kind === 'year') end.setUTCFullYear(end.getUTCFullYear() + 1);
	if (period.kind === 'month') end.setUTCMonth(end.getUTCMonth() + 1);
	if (period.kind === 'day') end.setUTCDate(end.getUTCDate() + 1);
	end.setUTCDate(end.getUTCDate() - 1);
	return { from, to: toIso(end) };
}

export const inRange = (date: string, range: DateRange | null) =>
	!range || (date >= range.from && date <= range.to);

/** The year, month or day before (-1) or after (1) */
export function stepPeriod(period: Period, by: -1 | 1): Period {
	if (period.kind === 'all') return period;
	const date = utc(rangeStart(period.kind, period.at));
	if (period.kind === 'year') date.setUTCFullYear(date.getUTCFullYear() + by);
	if (period.kind === 'month') date.setUTCMonth(date.getUTCMonth() + by);
	if (period.kind === 'day') date.setUTCDate(date.getUTCDate() + by);
	return { kind: period.kind, at: atOf(period.kind, toIso(date)) };
}

const atOf = (kind: Exclude<PeriodKind, 'all'>, date: string) =>
	kind === 'year' ? date.slice(0, 4) : kind === 'month' ? date.slice(0, 7) : date;

/**
 * Another kind of period around the one shown, e.g. October 2026 as a year is 2026, as a
 * day it's today if that's in October, else its last day. From all of it: around the
 * group's last expense.
 */
export function switchKind(period: Period, kind: PeriodKind, today: string, last: string | null) {
	if (kind === 'all') return { kind } satisfies Period;
	const range = periodRange(period);
	const date = range
		? today < range.from
			? range.from
			: today > range.to
				? range.to
				: today
		: (last ?? today);
	return { kind, at: atOf(kind, date) } satisfies Period;
}

/** Whether there's anything before or after this period, from the group's first and last date */
export function canStep(period: Period, span: DateRange | null, by: -1 | 1) {
	if (period.kind === 'all' || !span) return false;
	const next = periodRange(stepPeriod(period, by))!;
	return by < 0 ? next.to >= span.from : next.from <= span.to;
}

/** Every year, month or day from the group's first expense to its last, oldest first */
export function periodsWithin(kind: Exclude<PeriodKind, 'all'>, span: DateRange): string[] {
	const list: string[] = [];
	const last = atOf(kind, span.to);
	for (let at = atOf(kind, span.from); at <= last;) {
		list.push(at);
		at = (stepPeriod({ kind, at }, 1) as { at: string }).at;
	}
	return list;
}

/** The chart's columns for a period; for all of it, they follow its length */
export const unitFor = (period: Period): Unit | null =>
	period.kind === 'year' ? 'month' : period.kind === 'month' ? 'day' : null;

/** The address parameters for a period */
export const periodParams = (period: Period) =>
	period.kind === 'all' ? 'period=all' : `period=${period.kind}&at=${period.at}`;
