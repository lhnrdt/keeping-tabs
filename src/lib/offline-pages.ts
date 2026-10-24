// Copies of pages kept by the service worker for viewing offline (N-3). Shared with it, so
// the app can remove them, e.g. after deleting the identity (#138).

/** One cache per app version: `pages-<version>` */
export const PAGES_CACHE_PREFIX = 'pages-';

/** Removes every version's offline page copies from this browser */
export async function clearOfflinePages() {
	if (typeof caches === 'undefined') return;
	const names = await caches.keys();
	await Promise.all(
		names.filter((name) => name.startsWith(PAGES_CACHE_PREFIX)).map((name) => caches.delete(name))
	);
}
