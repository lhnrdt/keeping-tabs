// Settings save as soon as they change, in the background, and briefly say so.
import type { SubmitFunction } from '$app/forms';

const SHOWN_MS = 2000;

export class SavedSetting {
	/** The setting just saved, while that shows */
	saved = $state<string>();
	#timer: ReturnType<typeof setTimeout> | undefined;

	#after = (invalidateAll: boolean): SubmitFunction => {
		return () =>
			async ({ result, update }) => {
				if (result.type === 'success') {
					this.saved = String(result.data?.setting);
					clearTimeout(this.#timer);
					this.#timer = setTimeout(() => (this.saved = undefined), SHOWN_MS);
				}
				await update({ reset: false, invalidateAll });
			};
	};

	/** Without reloading the page's data */
	quietly = this.#after(false);
	/** For what changes how the rest of the app shows things */
	andShown = this.#after(true);
}
