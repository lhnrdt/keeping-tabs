// Ready for offline (#347): screens that haven't been opened yet are kept too when the app asks,
// e.g. a group's form for a new expense, so it opens without a connection the first time.
import { PAGES_CACHE } from './caches';

/** Keeps each page and its data, as a visit would; quietly gives up on what doesn't come */
export async function warm(urls: string[]) {
	const pages = await caches.open(PAGES_CACHE);
	await Promise.all(
		urls.flatMap((url) => {
			const data = `${url.replace(/\/$/, '')}/__data.json`;
			return [
				[url, 'text/html'],
				[data, 'application/json']
			].map(async ([address, accept]) => {
				const response = await fetch(address, { credentials: 'include', headers: { accept } });
				if (response.status === 200 && !response.redirected) await pages.put(address, response);
			});
		})
	).catch(() => {});
}

/**
 * Brings every kept copy of these pages' data up to date, whichever parameters SvelteKit asked
 * with, e.g. a group's after changes from this device reached the server
 */
export async function refreshKept(paths: string[]) {
	const pages = await caches.open(PAGES_CACHE);
	const kept = (await pages.keys()).filter((request) => {
		const { pathname } = new URL(request.url);
		return (
			pathname.endsWith('/__data.json') &&
			paths.some((path) => pathname === `${path.replace(/\/$/, '')}/__data.json`)
		);
	});
	await Promise.all(
		kept.map(async (request) => {
			const response = await fetch(request.url, {
				credentials: 'include',
				headers: { accept: 'application/json' }
			});
			if (response.status === 200 && !response.redirected) await pages.put(request, response);
		})
	).catch(() => {});
}
