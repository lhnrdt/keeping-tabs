import { prefersReducedMotion } from 'svelte/motion';

/**
 * Runs a same-page update inside a view transition, so elements with a
 * `view-transition-name` (list items) move, appear and disappear smoothly (N-12).
 * The page itself doesn't slide: see `[data-transition='in-place']` in layout.css.
 */
export async function inPlaceTransition(update: () => Promise<void>) {
	if (!document.startViewTransition || prefersReducedMotion.current) return update();
	const root = document.documentElement;
	root.dataset.transition = 'in-place';
	const transition = document.startViewTransition(update);
	transition.finished.finally(() => delete root.dataset.transition);
	return transition.updateCallbackDone;
}

/** A view-transition-name for a list item; ids are UUIDs, so they're valid and unique. */
export const transitionName = (kind: string, id: string) => `view-transition-name: ${kind}-${id}`;
