// Other people's changes show up without reloading (#65). Asking now and then stays within the
// free plan, where a connection kept open would not: only an open, visible screen asks, and it
// reloads its data only when something changed.
import { invalidateAll } from '$app/navigation';

const EVERY_MS = 15_000;

/** Starts following; returns a function that stops it */
export function followChanges(url: string) {
	let known: number | null | undefined;
	const ask = async () => {
		if (document.visibilityState !== 'visible' || !navigator.onLine) return;
		try {
			const response = await fetch(url);
			if (!response.ok) return;
			const { at } = (await response.json()) as { at: number | null };
			if (known !== undefined && at !== known) await invalidateAll();
			known = at;
		} catch {
			// The connection went away; the next round tries again
		}
	};
	ask();
	const timer = setInterval(ask, EVERY_MS);
	return () => clearInterval(timer);
}
