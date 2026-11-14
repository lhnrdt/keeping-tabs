// How each request is answered: the app's own files from the cache; pages from the network,
// falling back to the last copy when offline; pages' data from the last copy at once, brought up
// to date in the background (#347), unless something was just changed; everything else untouched.
import { self } from '$app/service-worker';
import { APP_CACHE, OFFLINE_PAGE, PAGES_CACHE, precached } from './caches';

/** SvelteKit loads a page's data from <page>/__data.json on client-side navigation */
const isPageData = (url: URL) => url.pathname.endsWith('/__data.json');

export type Strategy = 'cache' | 'network-first' | 'kept-first';

export function strategyFor(request: Request): Strategy | undefined {
	const url = new URL(request.url);
	if (request.method !== 'GET' || url.origin !== location.origin) return undefined;
	if (precached.has(url.pathname)) return 'cache';
	if (isPageData(url)) return isFresh() ? 'network-first' : 'kept-first';
	if (request.mode === 'navigate') return 'network-first';
	return undefined;
}

/** For a few seconds after a change (a form sent here, or news the app heard of) */
const FRESH_MS = 8_000;
let freshUntil = 0;
export const keepFresh = () => (freshUntil = Date.now() + FRESH_MS);
const isFresh = () => Date.now() < freshUntil;

/**
 * The last copy at once, and the network's in the background; if it's different, the app is
 * told, and its next load (from the copy, now the new one) shows it
 */
export async function keptFirst(request: Request, background: (work: Promise<unknown>) => void) {
	const pages = await caches.open(PAGES_CACHE);
	const kept = await pages.match(request);
	if (!kept) return networkFirst(request);
	background(
		(async () => {
			const response = await fetch(request);
			if (response.status !== 200) return;
			const [before, after] = await Promise.all([kept.clone().text(), response.clone().text()]);
			await pages.put(request, response);
			if (before !== after) await tellApp(request.url);
		})().catch(() => {
			// Offline: the copy it was
		})
	);
	return kept;
}

async function tellApp(url: string) {
	for (const client of await self.clients.matchAll({ type: 'window' })) {
		client.postMessage({ type: 'data-updated', url });
	}
}

export async function fromCache(request: Request) {
	const cached = await (await caches.open(APP_CACHE)).match(request);
	return cached ?? fetch(request);
}

export async function networkFirst(request: Request) {
	const pages = await caches.open(PAGES_CACHE);
	try {
		const response = await fetch(request);
		if (response.status === 200) await pages.put(request, response.clone());
		return response;
	} catch (error) {
		// The same page with other parameters (SvelteKit adds some to its data requests) beats
		// no page: e.g. back to a group after keeping an expense offline (#55)
		// Kept ahead of time too (warm.ts), when its request's headers were others
		const cached =
			(await pages.match(request, { ignoreVary: true })) ??
			(await pages.match(request, { ignoreSearch: true, ignoreVary: true }));
		if (cached) return cached;
		if (request.mode !== 'navigate') throw error;
		return (await (await caches.open(APP_CACHE)).match(OFFLINE_PAGE)) ?? Response.error();
	}
}
