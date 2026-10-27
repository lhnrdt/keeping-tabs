/** A day as an <input type="date"> value, in the visitor's time zone: today, or `daysAgo` before. */
export function dayInputValue(daysAgo = 0, now = new Date()): string {
	const day = new Date(now.getTime() - daysAgo * 86_400_000);
	return new Date(day.getTime() - day.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** Today as an <input type="date"> value, in the visitor's time zone. */
export const todayInputValue = (now = new Date()) => dayInputValue(0, now);
