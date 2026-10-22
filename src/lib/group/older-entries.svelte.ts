// Older pages of the expense list, fetched while scrolling. Pages are counted by position,
// so an entry added meanwhile could arrive twice; callers merge by id.
import type { ListEntry } from '#lib/server/expense-entries.ts';

export class OlderEntries {
	items = $state<ListEntry[]>([]);
	/** Whether the server has more; undefined until the first page arrived */
	more = $state<boolean>();
	loading = $state(false);
	failed = $state(false);

	constructor(private readonly url: (offset: number) => string) {}

	async load(offset: number) {
		if (this.loading) return;
		this.loading = true;
		this.failed = false;
		try {
			const response = await fetch(this.url(offset));
			if (!response.ok) throw new Error(String(response.status));
			const page: { entries: ListEntry[]; hasMore: boolean } = await response.json();
			this.items = [...this.items, ...page.entries];
			this.more = page.hasMore;
		} catch {
			this.failed = true;
		} finally {
			this.loading = false;
		}
	}
}
