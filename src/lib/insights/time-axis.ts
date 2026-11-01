// Time along a chart's axis, the same in every chart: every year gets its mark over a long time, and a
// date always says which year it's in. Dates are UTC days throughout.
const DAY_MS = 86_400_000;
/** From here on, the axis marks years */
const YEARS_FROM_DAYS = 548;
/** From here on, it marks months; below that, the first, middle and last day */
const MONTHS_FROM_DAYS = 62;
const MOST_MONTH_MARKS = 4;

const format = (date: Date, locale: string, options: Intl.DateTimeFormatOptions) =>
	new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(date);

export const fullDate = (date: Date, locale: string) =>
	format(date, locale, { day: 'numeric', month: 'short', year: 'numeric' });

const spanOf = (from: Date, to: Date) => (to.getTime() - from.getTime()) / DAY_MS;

/** Where the axis gets a mark, between these days */
export function timeTicks(from: Date, to: Date): Date[] {
	const days = spanOf(from, to);
	const firstYear = from.getUTCFullYear();
	const lastYear = to.getUTCFullYear();
	if (days >= YEARS_FROM_DAYS) {
		const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
		return years
			.map((year) => new Date(Date.UTC(year, 0, 1)))
			.filter((date) => date >= from && date <= to);
	}
	if (days >= MONTHS_FROM_DAYS) {
		const months = (lastYear - firstYear) * 12 + to.getUTCMonth() - from.getUTCMonth();
		const step = Math.max(1, Math.ceil(months / MOST_MONTH_MARKS));
		const ticks: Date[] = [];
		for (let i = 1; i <= months; i += step) {
			ticks.push(new Date(Date.UTC(firstYear, from.getUTCMonth() + i, 1)));
		}
		return ticks;
	}
	return [from, new Date((from.getTime() + to.getTime()) / 2), to];
}

/** What a mark says, for an axis between these days */
export function timeLabel(from: Date, to: Date, locale: string) {
	const days = spanOf(from, to);
	if (days >= YEARS_FROM_DAYS) return (date: Date) => String(date.getUTCFullYear());
	if (days >= MONTHS_FROM_DAYS) {
		return (date: Date) => format(date, locale, { month: 'short', year: 'numeric' });
	}
	return (date: Date) => fullDate(date, locale);
}

/**
 * The same for bars, which only have marks where a bar is: the first bar at or after each of those
 * marks. `starts`: each bar's first day, in order.
 */
export function barTicks(starts: readonly string[]) {
	if (starts.length < 2) return [...starts];
	const dates = starts.map((start) => new Date(`${start}T00:00:00Z`));
	const marks = timeTicks(dates[0], dates.at(-1)!);
	const ticks = marks.map((mark) => starts[dates.findIndex((date) => date >= mark)]);
	return [...new Set(ticks.filter(Boolean))];
}

export function barLabel(starts: readonly string[], locale: string) {
	const first = new Date(`${starts[0]}T00:00:00Z`);
	const last = new Date(`${starts.at(-1) ?? starts[0]}T00:00:00Z`);
	const label = timeLabel(first, last, locale);
	return (start: string) => label(new Date(`${start}T00:00:00Z`));
}
