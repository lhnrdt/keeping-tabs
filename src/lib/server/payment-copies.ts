// How to pay someone, as each of their groups keeps it (#110).
import { and, eq, inArray } from 'drizzle-orm';
import { isSealed } from '#lib/crypto/seal.ts';
import { LIMITS } from '#lib/validation.ts';
import type { Db } from './db';
import { groups, members } from './db/schema';

export type PaymentCopy = { memberId: string; value: string | null };

const parseCopies = (json: FormDataEntryValue | null): PaymentCopy[] | null => {
	try {
		const copies = JSON.parse(String(json ?? '[]'));
		const valid =
			Array.isArray(copies) &&
			copies.length <= 500 &&
			copies.every(
				(copy) =>
					typeof copy?.memberId === 'string' &&
					(copy.value === null || typeof copy.value === 'string')
			);
		return valid ? copies : null;
	} catch {
		return null;
	}
};

/**
 * Stores this person's copies: only on their own members, sealed where the group is encrypted, and
 * of a sensible length where it's plain. False if the form makes no sense.
 */
export async function savePaymentCopies(db: Db, personId: string, json: FormDataEntryValue | null) {
	const copies = parseCopies(json);
	if (!copies) return false;
	if (copies.length === 0) return true;
	const mine = await db
		.select({ id: members.id, keyId: groups.keyId })
		.from(members)
		.innerJoin(groups, eq(members.groupId, groups.id))
		.where(
			and(
				eq(members.personId, personId),
				inArray(
					members.id,
					copies.map((copy) => copy.memberId)
				)
			)
		);
	const keyIds = new Map(mine.map((row) => [row.id, row.keyId]));
	for (const { memberId, value } of copies) {
		if (!keyIds.has(memberId) || value === null) continue;
		const fits = keyIds.get(memberId) ? isSealed(value) : value.length <= LIMITS.paymentDetails;
		if (!fits) return false;
	}
	await Promise.all(
		copies
			.filter((copy) => keyIds.has(copy.memberId))
			.map((copy) =>
				db.update(members).set({ paymentDetails: copy.value }).where(eq(members.id, copy.memberId))
			)
	);
	return true;
}
