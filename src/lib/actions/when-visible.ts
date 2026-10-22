// Calls `onVisible` when the element comes near the viewport, e.g. to load more while
// scrolling. Pass a changing `key` (like the number of loaded items) to check again
// after each load, in case the element is still in view.
import type { Action } from 'svelte/action';

type Options = { onVisible: () => void; key: unknown; margin?: string };

export const whenVisible: Action<HTMLElement, Options> = (node, options) => {
	let observer: IntersectionObserver | undefined;
	const observe = ({ onVisible, margin = '800px' }: Options) => {
		observer?.disconnect();
		observer = new IntersectionObserver(
			(records) => {
				if (records.some((record) => record.isIntersecting)) onVisible();
			},
			{ rootMargin: `0px 0px ${margin} 0px` }
		);
		observer.observe(node);
	};
	observe(options);
	return { update: observe, destroy: () => observer?.disconnect() };
};
