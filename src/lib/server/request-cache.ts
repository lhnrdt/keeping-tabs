// Lookups shared by the loads of one request (#58): the layouts and the page ask for the
// same group, members or person, and they run in parallel instead of one after the other.
// For loads only: actions may change what was looked up, so they read fresh.

const caches = new WeakMap<App.Locals, Map<string, Promise<unknown>>>();

/** `load` once per request and key; later calls share its answer */
export function once<T>(locals: App.Locals, key: string, load: () => Promise<T>): Promise<T> {
	let cache = caches.get(locals);
	if (!cache) caches.set(locals, (cache = new Map()));
	if (!cache.has(key)) cache.set(key, load());
	return cache.get(key) as Promise<T>;
}
