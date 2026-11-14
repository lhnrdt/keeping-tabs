// The new entry's way into the list (#291): the whole screen it was filled in on shrinks, smaller
// and smaller, onto the place of its row in the list and becomes it (a container transform, in
// one view transition; everyday-motion.css). The list is there underneath all along.
import { tick } from 'svelte';
import { cueMoment, peekMoment } from './moments';

const NAME = 'new-entry';

/** Names the screen, if an entry was just added on it; the row to find afterwards */
export function morphFrom(): string | null {
	const moment = peekMoment();
	const screen = document.querySelector<HTMLElement>('.k-page');
	if (!moment?.id || moment.kind !== 'added' || !screen) return null;
	screen.style.viewTransitionName = NAME;
	document.documentElement.dataset.transition = 'morph';
	cueMoment({ ...moment, morphed: true });
	return moment.id;
}

/** ...and names its row once the list is drawn; all of it goes when the transition is over */
export async function morphTo(id: string, finished: Promise<unknown>) {
	await tick();
	const row = document.querySelector<HTMLElement>(`[data-entry="${CSS.escape(id)}"]`);
	if (row) row.style.viewTransitionName = NAME;
	finished.finally(() => {
		row?.style.removeProperty('view-transition-name');
		delete document.documentElement.dataset.transition;
	});
}
