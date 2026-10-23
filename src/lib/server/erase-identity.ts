// Deleting an identity (GDPR right to erasure, #74): everything that ties a person to this
// app goes. Their members stay in their groups, unlinked ("not here yet"), because past
// expenses refer to them; with `anonymizeAs` their names are replaced by that name.
import { eq, sql } from 'drizzle-orm';
import type { Db } from './db';
import { deviceLinks, devices, members, passkeys, people } from './db/schema';

/**
 * `anonymizeAs`: the name that replaces theirs (e.g. "Former member"), or null to keep names.
 * The start of the member's id is added, which keeps names unique in a group (M-5).
 */
export async function eraseIdentity(db: Db, personId: string, anonymizeAs: string | null) {
	// One transaction; rows that refer to the person go before the person
	await db.batch([
		db
			.update(members)
			.set(
				anonymizeAs
					? { personId: null, name: sql`${anonymizeAs} || ' ' || substr(${members.id}, 1, 4)` }
					: { personId: null }
			)
			.where(eq(members.personId, personId)),
		db.delete(passkeys).where(eq(passkeys.personId, personId)),
		db.delete(deviceLinks).where(eq(deviceLinks.personId, personId)),
		db.delete(devices).where(eq(devices.personId, personId)),
		db.delete(people).where(eq(people.id, personId))
	]);
}
