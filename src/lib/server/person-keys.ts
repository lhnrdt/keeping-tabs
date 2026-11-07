// What's kept for a person's other devices (#110): only sealed copies of keys.
import { and, count, desc, eq, gt, sql } from 'drizzle-orm';
import { keyIdIn } from '#lib/crypto/seal.ts';
import type { Db } from './db';
import { people, personKeys, personVaults } from './db/schema';

/** Vaults no device has said it holds for this long are left out: probably cleared away */
const VAULT_GONE_MS = 90 * 24 * 60 * 60 * 1000;
/** ...and only the latest few, so a device doesn't put each key in ever more vaults */
const MAX_VAULTS = 10;

export async function keysOf(db: Db, personId: string, now = new Date()) {
	const [keys, [person], vaults] = await db.batch([
		db
			.select({ keyId: personKeys.keyId, sealed: personKeys.sealed })
			.from(personKeys)
			.where(eq(personKeys.personId, personId)),
		db.select({ recoveryVault: people.recoveryVault }).from(people).where(eq(people.id, personId)),
		db
			.select({
				vaultId: personVaults.vaultId,
				publicKey: personVaults.publicKey,
				seenAt: personVaults.seenAt
			})
			.from(personVaults)
			.where(
				and(
					eq(personVaults.personId, personId),
					gt(personVaults.seenAt, new Date(now.getTime() - VAULT_GONE_MS))
				)
			)
			.orderBy(desc(personVaults.seenAt))
			.limit(MAX_VAULTS)
	]);
	return {
		keys,
		recoveryVault: person?.recoveryVault ?? null,
		vaults: vaults.map(({ seenAt, ...vault }) => ({ ...vault, seenAt: seenAt.getTime() }))
	};
}

/** A device holding this vault says so, with its public key */
export const storeVault = (
	db: Db,
	personId: string,
	{ vaultId, publicKey }: { vaultId: string; publicKey: string },
	now = new Date()
) =>
	db
		.insert(personVaults)
		.values({ personId, vaultId, publicKey, seenAt: now })
		.onConflictDoUpdate({
			target: [personVaults.personId, personVaults.vaultId],
			set: { publicKey, seenAt: now }
		});

/** Sealed copies one person can keep, one per group and vault: far more than anyone needs */
const MAX_STORED = 10_000;

export async function storeKeys(
	db: Db,
	personId: string,
	keys: readonly { keyId: string; sealed: string }[]
) {
	const [{ stored }] = await db
		.select({ stored: count() })
		.from(personKeys)
		.where(eq(personKeys.personId, personId));
	if (stored + keys.length > MAX_STORED) return;
	for (const { keyId, sealed } of keys) {
		await db
			.insert(personKeys)
			.values({ personId, keyId, vaultId: keyIdIn(sealed), sealed })
			.onConflictDoUpdate({
				target: [personKeys.personId, personKeys.keyId, personKeys.vaultId],
				set: { sealed: sql`excluded.sealed` }
			});
	}
}

export const storeRecoveryVault = (db: Db, personId: string, recoveryVault: string) =>
	db.update(people).set({ recoveryVault }).where(eq(people.id, personId));
