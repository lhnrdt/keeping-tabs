// A private app among friends (#109): the start page and everything around it ask for a
// shared password once per device. Group links (invitations) and device links work without
// it. The password is a Cloudflare secret (ACCESS_PASSWORD); without it nobody gets in.
import type { Cookies } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import { sameBytes } from './secrets';

const ACCESS_COOKIE = 'kt-access';
const ACCESS_MAX_AGE = 400 * 24 * 60 * 60;

const accessPassword = () => (env as { ACCESS_PASSWORD?: string }).ACCESS_PASSWORD ?? '';

async function digest(text: string) {
	const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
	return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** What the cookie holds: changes when the password changes, so old devices are asked again */
const accessToken = (password: string) => digest(`keeping-tabs-access:${password}`);

/** Invitations and the password page itself */
export const isOpenPath = (pathname: string) =>
	pathname.startsWith('/g/') ||
	pathname.startsWith('/device/link') ||
	pathname.startsWith('/welcome') ||
	// A group's own password comes with a group link
	pathname.startsWith('/unlock/') ||
	// Accepting the friendly note, also for friends who came with a group link
	pathname === '/note';

export async function hasAccess(cookies: Cookies) {
	const password = accessPassword();
	return Boolean(password) && cookies.get(ACCESS_COOKIE) === (await accessToken(password));
}

export async function grantAccess(cookies: Cookies) {
	cookies.set(ACCESS_COOKIE, await accessToken(accessPassword()), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: ACCESS_MAX_AGE
	});
}

/** Compares digests, so the check takes the same time whatever is typed */
export async function isAccessPassword(given: unknown) {
	const password = accessPassword();
	if (!password || typeof given !== 'string') return false;
	const encode = (text: string) => new TextEncoder().encode(text);
	const [a, b] = await Promise.all([
		crypto.subtle.digest('SHA-256', encode(given.trim())),
		crypto.subtle.digest('SHA-256', encode(password))
	]);
	return sameBytes(new Uint8Array(a), new Uint8Array(b));
}
