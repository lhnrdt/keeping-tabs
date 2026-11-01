// What's kept for a person's other devices (#110): only sealed copies of keys.
import { eq, sql } from 'drizzle-orm';
import type { Db } from './db';
import { people, personKeys } from './db/schema';

export async function keysOf(db: Db, personId: string) {
	const [keys, [person]] = await db.batch([
		db
			.select({ keyId: personKeys.keyId, sealed: personKeys.sealed })
			.from(personKeys)
			.where(eq(personKeys.personId, personId)),
		db.select({ recoveryVault: people.recoveryVault }).from(people).where(eq(people.id, personId))
	]);
	return { keys, recoveryVault: person?.recoveryVault ?? null };
}

export async function storeKeys(
	db: Db,
	personId: string,
	keys: readonly { keyId: string; sealed: string }[]
) {
	for (const { keyId, sealed } of keys) {
		await db
			.insert(personKeys)
			.values({ personId, keyId, sealed })
			.onConflictDoUpdate({
				target: [personKeys.personId, personKeys.keyId],
				set: { sealed: sql`excluded.sealed` }
			});
	}
}

export const storeRecoveryVault = (db: Db, personId: string, recoveryVault: string) =>
	db.update(people).set({ recoveryVault }).where(eq(people.id, personId));
