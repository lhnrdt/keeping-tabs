// Settled groups fold away on the start screen (#46): nothing open between anyone, and
// quiet for a while. A new group without entries stays in view.

/** How long a settled group stays in view after its last entry */
export const SETTLED_QUIET_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export function isSettledAndQuiet(
	group: { balance: number; open: readonly unknown[]; lastEntry: string | null },
	/** YYYY-MM-DD */
	today: string
) {
	if (group.balance !== 0 || group.open.length > 0 || !group.lastEntry) return false;
	const quiet =
		(Date.parse(`${today}T00:00:00Z`) - Date.parse(`${group.lastEntry}T00:00:00Z`)) / DAY_MS;
	return quiet > SETTLED_QUIET_DAYS;
}
