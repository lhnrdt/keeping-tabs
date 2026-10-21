import type { ActionResult, SubmitFunction } from '$app/forms';

/**
 * Pending state for a progressively enhanced form (N-11): pass `submission.enhance`
 * to `use:enhance` and read `submission.pending` for the busy UI.
 */
export class Submission {
	pending = $state(false);

	constructor(private readonly onResult?: (result: ActionResult) => void) {}

	enhance: SubmitFunction = () => {
		this.pending = true;
		return async ({ result, update }) => {
			try {
				await update();
			} finally {
				this.pending = false;
			}
			this.onResult?.(result);
		};
	};
}
