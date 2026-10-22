// Makes Keeping Tabs installable and viewable offline (N-3). Each version caches its own
// files; a new version takes over right away and the app reloads on its next navigation.
import { self } from '$app/service-worker';
import { APP_CACHE, fetchForCache, PAGES_CACHE, precached } from './caches';
import { fromCache, networkFirst, strategyFor } from './respond';

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(APP_CACHE)
			.then((cache) =>
				Promise.all([...precached].map(async (path) => cache.put(path, await fetchForCache(path))))
			)
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	const current = new Set([APP_CACHE, PAGES_CACHE]);
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => !current.has(key)).map((key) => caches.delete(key)))
			)
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const strategy = strategyFor(event.request);
	if (strategy === 'cache') event.respondWith(fromCache(event.request));
	if (strategy === 'network-first') event.respondWith(networkFirst(event.request));
});
