// When the copy kept on this device won't do (#347): for a few seconds after something was
// changed here (a form sent) or news came from elsewhere (the change check), loads go to the
// server first, so what was just done is there. Otherwise the kept copy shows at once and is
// brought up to date in the background. Told to the service worker too, which keeps page data.
const FRESH_MS = 8_000;
let freshUntil = 0;

/** What comes next must be the server's */
export function wantFresh() {
	freshUntil = Date.now() + FRESH_MS;
	navigator.serviceWorker?.controller?.postMessage({ type: 'fresh' });
}

/** Whether loads should go to the server first just now */
export const needsFresh = () => Date.now() < freshUntil;
