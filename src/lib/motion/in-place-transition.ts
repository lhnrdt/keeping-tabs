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

/**
 * A view-transition-name for a list item; ids are UUIDs, so they're valid and unique. Only
 * applied during same-page updates (layout.css): on page transitions the whole page moves as
 * one, else named items would be drawn above the tab bar (#114).
 */
export const transitionName = (kind: string, id: string) => `--vt-name: ${kind}-${id}`;
