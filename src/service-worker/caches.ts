// The service worker's caches: the app itself (per version) and pages seen while online.
import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';

/** Built files and static files of this version, served from the cache */
export const APP_CACHE = `app-${version}`;
/** Pages and their data, kept for viewing offline; replaced along with the app */
export const PAGES_CACHE = `pages-${version}`;

/** Shown when a page is opened offline that wasn't seen online before */
export const OFFLINE_PAGE = '/offline.html';

export const precached = new Set([...immutable, ...assets].map(({ path }) => `/${path}`));

/**
 * Fetches a file for the cache. Cloudflare redirects "/offline.html" to "/offline", and
 * browsers refuse a redirected response as the answer to a navigation, so keep a plain copy.
 */
export async function fetchForCache(path: string) {
	const response = await fetch(path);
	if (!response.ok) throw new Error(`${path}: ${response.status}`);
	if (!response.redirected) return response;
	const { status, statusText, headers } = response;
	return new Response(await response.blob(), { status, statusText, headers });
}
