// A group's optional password (A-8 – A-11), on top of its secret link. Stored only as a salted,
// slow hash; once entered it's remembered on the device in a cookie that stops working when the
// password changes.
import type { Cookies } from '@sveltejs/kit';
import { eq, and, isNull } from 'drizzle-orm';
import { log } from './activity';
import type { Db } from './db';
import { groups } from './db/schema';
import { hashSecret, sameBytes } from './secrets';
import { SHARE_TOKEN_PATTERN } from './token';

/**
 * PBKDF2 rounds: slow for guessing, yet within the free plan's CPU limit per request. Kept with
 * each hash, so it can be raised later. Attempts are rate-limited on top (rate-limit-kinds.ts).
 */
const ITERATIONS = 20_000;
const REMEMBER_SECONDS = 400 * 24 * 60 * 60;

const toHex = (bytes: Uint8Array) =>
	[...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string) =>
	Uint8Array.from(hex.match(/../g) ?? [], (pair) => Number.parseInt(pair, 16));

async function derive(password: string, salt: Uint8Array, iterations: number) {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
		key,
		256
	);
	return new Uint8Array(bits);
}

/** "pbkdf2$rounds$salt$hash" */
export async function hashGroupPassword(password: string) {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = await derive(password, salt, ITERATIONS);
	return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

export async function matchesGroupPassword(given: string, stored: string) {
	const [, rounds, salt, hash] = stored.split('$');
	return sameBytes(await derive(given, fromHex(salt), Number(rounds)), fromHex(hash));
}

/** The group behind a link and its password hash; never for the browser. Not kept for the
 * request: a form that changes the password renders the page in that same request. */
export async function findGroupLock(db: Db, token: string) {
	if (!SHARE_TOKEN_PATTERN.test(token)) return undefined;
	const [row] = await db
		.select({ id: groups.id, passwordHash: groups.passwordHash })
		.from(groups)
		.where(and(eq(groups.shareToken, token), isNull(groups.deletedAt)));
	return row;
}

const cookieNameOf = (groupId: string) => `kt-group-${groupId}`;
/** Follows the hash: a new password asks everyone again */
const rememberedValue = (passwordHash: string) => hashSecret(`keeping-tabs-group:${passwordHash}`);

export const isUnlocked = async (cookies: Cookies, groupId: string, passwordHash: string) =>
	cookies.get(cookieNameOf(groupId)) === (await rememberedValue(passwordHash));

export async function rememberUnlocked(cookies: Cookies, groupId: string, passwordHash: string) {
	cookies.set(cookieNameOf(groupId), await rememberedValue(passwordHash), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: REMEMBER_SECONDS
	});
}

/** Sets, changes or (with null) removes it, in the activity log without the password (A-10) */
export async function setGroupPassword(
	db: Db,
	groupId: string,
	actorId: string | null,
	passwordHash: string | null
) {
	await db.batch([
		db.update(groups).set({ passwordHash }).where(eq(groups.id, groupId)),
		log(db, groupId, actorId, passwordHash ? 'group.password_set' : 'group.password_remove', {})
	]);
}
