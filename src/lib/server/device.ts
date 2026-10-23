import type { Cookies } from '@sveltejs/kit';
import { randomSecret } from './secrets';

// The device identity (A-12): a 256-bit secret in an HTTP-only cookie, created on first visit.

const DEVICE_COOKIE = 'kt-device';
const DEVICE_KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	// Browsers cap cookies at about 400 days; it's renewed on every visit
	maxAge: 400 * 24 * 60 * 60
} as const;

/** Forgets this browser's device key (after deleting the identity behind it). */
export const forgetDeviceKey = (cookies: Cookies) => cookies.delete(DEVICE_COOKIE, { path: '/' });

/** This browser's device key, creating it if needed; refreshes the cookie's lifetime. */
export function ensureDeviceKey(cookies: Cookies): string {
	const existing = cookies.get(DEVICE_COOKIE);
	const key = existing && DEVICE_KEY_PATTERN.test(existing) ? existing : randomSecret(32);
	cookies.set(DEVICE_COOKIE, key, COOKIE_OPTIONS);
	return key;
}
