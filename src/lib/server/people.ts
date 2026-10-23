import { and, eq, gt, isNull } from 'drizzle-orm';
import type { Locale, Theme } from '#lib/settings.ts';
import type { Db } from './db';
import { deviceLinks, devices, people } from './db/schema';
import { newRecoveryKey, normalizeRecoveryKey } from './recovery-key';
import { hashSecret, randomSecret } from './secrets';

// People are created lazily: a device only gets a person once it claims or creates something.

const DEVICE_LINK_LIFETIME_MS = 15 * 60 * 1000;

export type Person = {
	id: string;
	name: string | null;
	/** Personal settings (S-3); null follows the browser */
	locale: Locale | null;
	theme: Theme | null;
};

/** The person this device belongs to, if any. */
export async function findPerson(db: Db, deviceKey: string): Promise<Person | undefined> {
	const [row] = await db
		.select({ id: people.id, name: people.name, locale: people.locale, theme: people.theme })
		.from(devices)
		.innerJoin(people, eq(devices.personId, people.id))
		.where(eq(devices.keyHash, await hashSecret(deviceKey)));
	return row;
}

/** The person this device belongs to, creating one for a new device. */
export async function ensurePerson(db: Db, deviceKey: string): Promise<Person> {
	const existing = await findPerson(db, deviceKey);
	if (existing) return existing;
	const id = crypto.randomUUID();
	await db.batch([
		db.insert(people).values({ id }),
		db.insert(devices).values({ keyHash: await hashSecret(deviceKey), personId: id })
	]);
	return { id, name: null, locale: null, theme: null };
}

/** Remembers the name someone uses, to pre-fill it next time (A-13). */
export async function setProfileName(db: Db, personId: string, name: string) {
	await db.update(people).set({ name }).where(eq(people.id, personId));
}

/** A single-use link token that connects another device to this person (A-14). */
export async function createDeviceLink(db: Db, personId: string): Promise<string> {
	const token = randomSecret(32);
	await db.insert(deviceLinks).values({
		tokenHash: await hashSecret(token),
		personId,
		expiresAt: new Date(Date.now() + DEVICE_LINK_LIFETIME_MS)
	});
	return token;
}

/**
 * Connects this device to the person behind a valid, unused link token.
 * Returns false for unknown, used or expired tokens.
 */
export async function useDeviceLink(db: Db, token: string, deviceKey: string): Promise<boolean> {
	const tokenHash = await hashSecret(token);
	const [link] = await db
		.update(deviceLinks)
		.set({ usedAt: new Date() })
		.where(
			and(
				eq(deviceLinks.tokenHash, tokenHash),
				isNull(deviceLinks.usedAt),
				gt(deviceLinks.expiresAt, new Date())
			)
		)
		.returning({ personId: deviceLinks.personId });
	if (!link) return false;

	await attachDevice(db, deviceKey, link.personId);
	return true;
}

/** Makes this device belong to a person (moving it away from any previous one). */
export async function attachDevice(db: Db, deviceKey: string, personId: string) {
	await db
		.insert(devices)
		.values({ keyHash: await hashSecret(deviceKey), personId })
		.onConflictDoUpdate({ target: devices.keyHash, set: { personId } });
}

/** Creates a new recovery key for the person, replacing any previous one (A-16). */
export async function createRecoveryKey(db: Db, personId: string): Promise<string> {
	const key = newRecoveryKey();
	const recoveryHash = await hashSecret(normalizeRecoveryKey(key)!);
	await db.update(people).set({ recoveryHash }).where(eq(people.id, personId));
	return key;
}

/** Makes this device the person behind a recovery key. Returns false for unknown keys. */
export async function restoreWithRecoveryKey(
	db: Db,
	input: string,
	deviceKey: string
): Promise<boolean> {
	const normalized = normalizeRecoveryKey(input);
	if (!normalized) return false;
	const person = await db.query.people.findFirst({
		columns: { id: true },
		where: eq(people.recoveryHash, await hashSecret(normalized))
	});
	if (!person) return false;
	await attachDevice(db, deviceKey, person.id);
	return true;
}
