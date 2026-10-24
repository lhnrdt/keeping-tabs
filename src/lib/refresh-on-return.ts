// Others change things while the app sits in the background: an open tab or an installed
// app brought back to the front shows fresh data, e.g. no group someone deleted (#125).
import { invalidateAll } from '$app/navigation';

/** Shorter breaks (switching apps for a moment) don't reload */
const AWAY_MS = 30_000;

/** Starts watching; returns a function that stops it */
export function refreshOnReturn() {
	let hiddenAt = 0;
	const refresh = () => {
		if (navigator.onLine) invalidateAll();
	};
	const onVisibility = () => {
		if (document.visibilityState === 'hidden') hiddenAt = Date.now();
		else if (hiddenAt && Date.now() - hiddenAt > AWAY_MS) refresh();
	};
	// Back and forward can restore a page as it was (back/forward cache)
	const onPageShow = (event: PageTransitionEvent) => {
		if (event.persisted) refresh();
	};
	document.addEventListener('visibilitychange', onVisibility);
	window.addEventListener('pageshow', onPageShow);
	return () => {
		document.removeEventListener('visibilitychange', onVisibility);
		window.removeEventListener('pageshow', onPageShow);
	};
}
