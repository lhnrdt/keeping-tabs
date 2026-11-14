// Pages show the copy kept on this device at once (#347); when the service worker hears the
// server's is different, the page loads again, from the copy that's now the new one. Anything
// sent from here makes what's loaded next the server's.
import { invalidateAll } from '$app/navigation';
import { wantFresh } from './freshness';

/** Starts following; returns a function that stops it */
export function followKept() {
	const updated = (event: MessageEvent) => {
		if (event.data?.type === 'data-updated') void invalidateAll();
	};
	const sent = () => wantFresh();
	navigator.serviceWorker?.addEventListener('message', updated);
	document.addEventListener('submit', sent, true);
	return () => {
		navigator.serviceWorker?.removeEventListener('message', updated);
		document.removeEventListener('submit', sent, true);
	};
}
