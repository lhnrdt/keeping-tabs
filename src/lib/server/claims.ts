import { and, eq, isNull } from 'drizzle-orm';
import { log } from './activity';
import type { Db } from './db';
import { members } from './db/schema';

// Claiming a member ties it to a person (A-4, A-5); releasing frees it again (A-15).

const current = (groupId: string, memberId: string) =>
	and(eq(members.id, memberId), eq(members.groupId, groupId), isNull(members.deletedAt));

/**
 * Claims an unclaimed member for a person and releases their previous member in the group.
 * Returns the member's name, or null if it doesn't exist or is already someone else's.
 */
export async function claimMember(db: Db, groupId: string, personId: string, memberId: string) {
	const target = await db.query.members.findFirst({
		columns: { name: true, personId: true },
		where: current(groupId, memberId)
	});
	if (!target || (target.personId && target.personId !== personId)) return null;
	if (target.personId === personId) return target.name;

	const [, , claimed] = await db.batch([
		db
			.update(members)
			.set({ personId: null })
			.where(
				and(eq(members.groupId, groupId), eq(members.personId, personId), isNull(members.deletedAt))
			),
		// Only if still unclaimed, so two people can't win the same member at once
		db
			.update(members)
			.set({ personId })
			.where(and(current(groupId, memberId), isNull(members.personId))),
		db.select({ personId: members.personId }).from(members).where(current(groupId, memberId))
	]);
	const won = claimed[0]?.personId === personId;
	if (!won) return null;
	await log(db, groupId, memberId, 'member.claim', { memberId });
	return target.name;
}

/** Frees a claimed member so it can be claimed again, e.g. after a lost device (A-15). */
export async function releaseMember(
	db: Db,
	groupId: string,
	actorId: string | null,
	memberId: string
) {
	await db.batch([
		db.update(members).set({ personId: null }).where(current(groupId, memberId)),
		log(db, groupId, actorId, 'member.release', { memberId })
	]);
}
