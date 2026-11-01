import { and, eq, gt, isNull } from 'drizzle-orm';
import type { Accent, Locale, Theme, Units } from '#lib/settings.ts';
import type { Db } from './db';
import { once } from './request-cache';
import { deviceLinks, devices, people, personKeys } from './db/schema';
import { isKey } from '#lib/crypto/seal.ts';
import { normalizeRecoveryKey, OLD_LENGTH } from '#lib/recovery-key-format.ts';
import { hashSecret, randomSecret } from './secrets';

// People are created lazily: a device only gets a person once it claims or creates something.

const DEVICE_LINK_LIFETIME_MS = 15 * 60 * 1000;

export type Person = {
	id: string;
	name: string | null;
	/** Personal settings (S-3); null follows the browser */
	locale: Locale | null;
	theme: Theme | null;
	accent: Accent | null;
	units: Units | null;
	displayCurrency: string | null;
	avatar: string | null;
	/** How to pay them (#47) */
	paymentDetails: string | null;
	sealedPaymentDetails: string | null;
	/** When they read the friendly note (#112) */
	notedAt: Date | null;
	notedVersion: number;
};

/** The person this device belongs to, if any. */
/**
 * For loads (#58): this device's person, looked up once per request and shared by the
 * layouts and the page. Actions use findPerson, as they may change who that is.
 */
export const personOf = (locals: App.Locals) =>
	once(locals, 'person', () => findPerson(locals.db, locals.deviceKey));

export async function findPerson(db: Db, deviceKey: string): Promise<Person | undefined> {
	const [row] = await db
		.select({
			id: people.id,
			name: people.name,
			locale: people.locale,
			theme: people.theme,
			accent: people.accent,
			units: people.units,
			displayCurrency: people.displayCurrency,
			avatar: people.avatar,
			paymentDetails: people.paymentDetails,
			sealedPaymentDetails: people.sealedPaymentDetails,
			notedAt: people.notedAt,
			notedVersion: people.notedVersion
		})
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
	return {
		id,
		name: null,
		locale: null,
		theme: null,
		accent: null,
		units: null,
		displayCurrency: null,
		avatar: null,
		paymentDetails: null,
		sealedPaymentDetails: null,
		notedAt: null,
		notedVersion: 0
	};
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

/**
 * Keeps a new recovery key's proof, replacing any previous one (A-16). The key itself is made in
 * the browser and never gets here; `vault` is the person's vault sealed with it (#110).
 */
export async function saveRecoveryKey(db: Db, personId: string, proof: string, vault: string) {
	await db
		.update(people)
		.set({ recoveryHash: await hashSecret(proof), recoveryVault: vault })
		.where(eq(people.id, personId));
}

/** What's hashed for a recovery key as sent: its proof, or an older key itself */
function recoveryCredential(sent: string) {
	if (isKey(sent)) return sent;
	const normalized = normalizeRecoveryKey(sent);
	return normalized?.length === OLD_LENGTH ? normalized : null;
}

/** Makes this device the person behind a recovery key. Returns false for unknown keys. */
export async function restoreWithRecoveryKey(
	db: Db,
	sent: string,
	deviceKey: string
): Promise<boolean> {
	const credential = recoveryCredential(sent);
	if (!credential) return false;
	const person = await db.query.people.findFirst({
		columns: { id: true },
		where: eq(people.recoveryHash, await hashSecret(credential))
	});
	if (!person) return false;
	await attachDevice(db, deviceKey, person.id);
	return true;
}

/** A key from before keys came along with it: it can't bring back encrypted groups (#110) */
export async function recoveryKeyIsOutdated(db: Db, personId: string) {
	const [[row], keys] = await db.batch([
		db
			.select({ hash: people.recoveryHash, vault: people.recoveryVault })
			.from(people)
			.where(eq(people.id, personId)),
		db
			.select({ keyId: personKeys.keyId })
			.from(personKeys)
			.where(eq(personKeys.personId, personId))
			.limit(1)
	]);
	return Boolean(row?.hash && !row.vault && keys.length);
}

/** Whether the person has made a recovery key (#151, for the backup's status) */
export async function hasRecoveryKey(db: Db, personId: string) {
	const [row] = await db
		.select({ hash: people.recoveryHash })
		.from(people)
		.where(eq(people.id, personId));
	return Boolean(row?.hash);
}
