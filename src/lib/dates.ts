/** Today as an <input type="date"> value, in the visitor's time zone. */
export function todayInputValue(now = new Date()): string {
	return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}
