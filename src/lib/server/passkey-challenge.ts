import type { Cookies } from '@sveltejs/kit';
import { and, eq, gt, lt } from 'drizzle-orm';
import type { Db } from './db';
import { passkeyChallenges } from './db/schema';
import { hashSecret } from './secrets';

// The WebAuthn challenge between "options" and "verify": in a short-lived HTTP-only cookie
// for this browser, and remembered (hashed) on the server so it works once (#71): answering
// crosses it off, and a copied cookie with a captured answer finds nothing.

const CHALLENGE_COOKIE = 'kt-passkey-challenge';
const LIFETIME_MS = 5 * 60 * 1000;

export async function setChallenge(db: Db, cookies: Cookies, challenge: string) {
	const now = Date.now();
	await db.batch([
		// Old ones go with each new one, so the table stays small
		db.delete(passkeyChallenges).where(lt(passkeyChallenges.expiresAt, new Date(now))),
		db.insert(passkeyChallenges).values({
			challengeHash: await hashSecret(challenge),
			expiresAt: new Date(now + LIFETIME_MS)
		})
	]);
	cookies.set(CHALLENGE_COOKIE, challenge, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		maxAge: LIFETIME_MS / 1000
	});
}

/** The challenge, if it's this browser's, unused and not expired; using it crosses it off */
export async function takeChallenge(db: Db, cookies: Cookies): Promise<string | undefined> {
	const challenge = cookies.get(CHALLENGE_COOKIE);
	cookies.delete(CHALLENGE_COOKIE, { path: '/' });
	if (!challenge) return undefined;
	const [taken] = await db
		.delete(passkeyChallenges)
		.where(
			and(
				eq(passkeyChallenges.challengeHash, await hashSecret(challenge)),
				gt(passkeyChallenges.expiresAt, new Date())
			)
		)
		.returning({ challengeHash: passkeyChallenges.challengeHash });
	return taken ? challenge : undefined;
}
