import type { ActionResult, SubmitFunction } from '$app/forms';
import { inPlaceTransition } from '#lib/motion/in-place-transition.ts';

/**
 * Pending state for a progressively enhanced form (N-11): pass `submission.enhance`
 * to `use:enhance` and read `submission.pending` for the busy UI. Same-page results
 * are applied with an in-place transition; redirects get the page transition.
 */
export class Submission {
	pending = $state(false);

	constructor(private readonly onResult?: (result: ActionResult) => void) {}

	enhance: SubmitFunction = () => {
		this.pending = true;
		return async ({ result, update }) => {
			try {
				await (result.type === 'redirect' ? update() : inPlaceTransition(() => update()));
			} finally {
				this.pending = false;
			}
			this.onResult?.(result);
		};
	};
}
