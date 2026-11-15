// Ready for offline (#347): while there's a connection, the screens someone may want without one
// are kept on the device ahead of time, such as a group's form for a new expense.

/** Asks the service worker to keep these screens */
export function keepReady(urls: string[]) {
	if (!navigator.onLine) return;
	navigator.serviceWorker?.controller?.postMessage({ type: 'warm', urls });
}

/** Tells the service worker these screens changed: its kept copies are brought up to date */
export function refreshReady(urls: string[]) {
	if (!navigator.onLine || urls.length === 0) return;
	navigator.serviceWorker?.controller?.postMessage({ type: 'refresh', urls });
}
