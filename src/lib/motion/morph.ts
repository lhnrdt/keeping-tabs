// The new entry's arrival in the list (#291): as the page goes back to it, its row comes into
// place on its own, softly (everyday-motion.css), in the same view transition. Named once the
// row is there; the name goes when the transition is over.
import { tick } from 'svelte';
import { peekMoment } from './moments';

const NAME = 'new-entry';

/** The row to bring in, if an entry was just added */
export const arriving = () => peekMoment()?.id ?? null;

/** Names its row once the list is drawn */
export async function bringIn(id: string, finished: Promise<unknown>) {
	await tick();
	const row = document.querySelector<HTMLElement>(`[data-entry="${CSS.escape(id)}"]`);
	if (!row) return;
	row.style.viewTransitionName = NAME;
	finished.finally(() => row.style.removeProperty('view-transition-name'));
}
