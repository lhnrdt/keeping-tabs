// The expense list shows the latest entries a page at a time, so groups with years of
// history (e.g. after an import) stay fast; balances still use everything.

export const EXPENSES_PER_PAGE = 50;

/** How many entries to show for ?show=N: whole pages, at least one. */
export function shownCount(param: string | null) {
	const count = Number(param);
	if (!Number.isInteger(count) || count <= EXPENSES_PER_PAGE) return EXPENSES_PER_PAGE;
	return Math.ceil(count / EXPENSES_PER_PAGE) * EXPENSES_PER_PAGE;
}
