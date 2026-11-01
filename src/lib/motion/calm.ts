// The calm motion of things appearing and going away in forms and lists: short, in the app's
// curve (--ease-calm), and none at all for people who prefer reduced motion.
import { flip } from 'svelte/animate';
import { quintOut } from 'svelte/easing';
import { prefersReducedMotion } from 'svelte/motion';
import { scale, slide } from 'svelte/transition';

const duration = (ms: number) => (prefersReducedMotion.current ? 0 : ms);

/** A row or block that opens and closes the space it takes */
export const calmSlide = (node: Element) =>
	slide(node, { duration: duration(200), easing: quintOut });

/** A photo or badge that appears in its place */
export const calmPop = (node: Element) =>
	scale(node, { duration: duration(200), start: 0.85, easing: quintOut });

/** The others moving up to fill a gap */
export const calmMove = (node: Element, positions: { from: DOMRect; to: DOMRect }) =>
	flip(node, positions, { duration: duration(200), easing: quintOut });
