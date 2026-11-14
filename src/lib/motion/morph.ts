// The new entry's way into the list (#291): what was filled in (the form's title and amount)
// turns into its row as the page goes back, in one view transition. Both carry the same name for
// it, the form before the page changes and the row once it's there.
import { tick } from 'svelte';
import { peekMoment } from './moments';

const NAME = 'new-entry';

/** Names what was filled in, if an entry was just added; the row to find afterwards */
export function morphFrom(): string | null {
	const id = peekMoment()?.id;
	const source = id ? document.querySelector<HTMLElement>('[data-morph-source]') : null;
	if (!id || !source) return null;
	source.style.viewTransitionName = NAME;
	return id;
}

/** ...and names its row, once the list is drawn; the names go when the transition is over */
export async function morphTo(id: string, finished: Promise<unknown>) {
	await tick();
	const row = document.querySelector<HTMLElement>(`[data-entry="${CSS.escape(id)}"]`);
	if (!row) return;
	row.style.viewTransitionName = NAME;
	finished.finally(() => row.style.removeProperty('view-transition-name'));
}
