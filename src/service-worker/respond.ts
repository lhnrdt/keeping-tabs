// How each request is answered: the app's own files from the cache; pages and their data
// from the network, falling back to the last copy when offline; everything else untouched.
import { APP_CACHE, OFFLINE_PAGE, PAGES_CACHE, precached } from './caches';

/** SvelteKit loads a page's data from <page>/__data.json on client-side navigation */
const isPageData = (url: URL) => url.pathname.endsWith('/__data.json');

export function strategyFor(request: Request): 'cache' | 'network-first' | undefined {
	const url = new URL(request.url);
	if (request.method !== 'GET' || url.origin !== location.origin) return undefined;
	if (precached.has(url.pathname)) return 'cache';
	if (request.mode === 'navigate' || isPageData(url)) return 'network-first';
	return undefined;
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
		const cached =
			(await pages.match(request)) ?? (await pages.match(request, { ignoreSearch: true }));
		if (cached) return cached;
		if (request.mode !== 'navigate') throw error;
		return (await (await caches.open(APP_CACHE)).match(OFFLINE_PAGE)) ?? Response.error();
	}
}
