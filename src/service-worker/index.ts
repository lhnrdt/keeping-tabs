// Makes Keeping Tabs installable and viewable offline (N-3). Each version caches its own
// files; a new version takes over right away and the app reloads on its next navigation.
import { self } from '$app/service-worker';
import { APP_CACHE, fetchForCache, PAGES_CACHE, precached } from './caches';
import './push';
import { fromCache, keepFresh, keptFirst, networkFirst, strategyFor } from './respond';
import { warm } from './warm';

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

// The app says what comes next must be the server's, or which screens to have ready (#347)
self.addEventListener('message', (event) => {
	if (event.data?.type === 'fresh') keepFresh();
	if (event.data?.type === 'warm' && Array.isArray(event.data.urls)) {
		event.waitUntil(warm(event.data.urls));
	}
});

self.addEventListener('fetch', (event) => {
	// Something sent from here (a form): what's loaded next comes from the server
	if (event.request.method !== 'GET') keepFresh();
	const strategy = strategyFor(event.request);
	if (strategy === 'kept-first') {
		event.respondWith(keptFirst(event.request, (work) => event.waitUntil(work)));
	}
	if (strategy === 'cache') event.respondWith(fromCache(event.request));
	if (strategy === 'network-first') event.respondWith(networkFirst(event.request));
});
