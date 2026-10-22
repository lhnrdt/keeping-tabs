import type { Cookies } from '@sveltejs/kit';

// The WebAuthn challenge between "options" and "verify" lives in a short-lived HTTP-only
// cookie; it's single-use because reading it also deletes it.

const CHALLENGE_COOKIE = 'kt-passkey-challenge';

export function setChallenge(cookies: Cookies, challenge: string) {
	cookies.set(CHALLENGE_COOKIE, challenge, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		maxAge: 5 * 60
	});
}

export function takeChallenge(cookies: Cookies): string | undefined {
	const challenge = cookies.get(CHALLENGE_COOKIE);
	cookies.delete(CHALLENGE_COOKIE, { path: '/' });
	return challenge;
}
