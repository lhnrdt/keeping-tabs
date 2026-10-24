// Deleting a group is a soft delete: it disappears for everyone, and any of its members can
// restore it from "Recently deleted" for a while (G-3), or remove it for good right away (#118).
import { and, eq, gt, isNotNull, isNull } from 'drizzle-orm';
import { DELETED_GROUP_DAYS, restorableUntil } from '#lib/group/retention.ts';
import { log } from './activity';
import type { Db } from './db';
import { groups, members } from './db/schema';
import { purgeDeletedGroup } from './purge';

const cutoff = () => new Date(Date.now() - DELETED_GROUP_DAYS * 24 * 60 * 60 * 1000);

export async function deleteGroup(db: Db, groupId: string, actorId: string) {
	await db.batch([
		db.update(groups).set({ deletedAt: new Date() }).where(eq(groups.id, groupId)),
		log(db, groupId, actorId, 'group.delete', {})
	]);
}

/** Groups this person was a member of that were deleted recently enough to restore. */
export async function listDeletedGroupsOf(db: Db, personId: string) {
	const rows = await db
		.select({
			id: groups.id,
			name: groups.name,
			kind: groups.kind,
			tint: groups.tint,
			deletedAt: groups.deletedAt
		})
		.from(members)
		.innerJoin(groups, eq(members.groupId, groups.id))
		.where(
			and(
				eq(members.personId, personId),
				isNull(members.deletedAt),
				isNotNull(groups.deletedAt),
				gt(groups.deletedAt, cutoff())
			)
		);
	return rows.map(({ deletedAt, ...group }) => ({
		...group,
		restorableUntil: restorableUntil(deletedAt!).toISOString()
	}));
}

/** Restores a deleted group for one of its members; false when they're not one or it's too late. */
/** Your member in a group that was deleted and can still be restored */
async function memberOfDeleted(db: Db, personId: string, groupId: string) {
	const [member] = await db
		.select({ id: members.id })
		.from(members)
		.innerJoin(groups, eq(members.groupId, groups.id))
		.where(
			and(
				eq(members.groupId, groupId),
				eq(members.personId, personId),
				isNull(members.deletedAt),
				isNotNull(groups.deletedAt),
				gt(groups.deletedAt, cutoff())
			)
		);
	return member;
}

export async function restoreGroup(db: Db, personId: string, groupId: string) {
	const member = await memberOfDeleted(db, personId, groupId);
	if (!member) return false;
	await db.batch([
		db.update(groups).set({ deletedAt: null }).where(eq(groups.id, groupId)),
		log(db, groupId, member.id, 'group.restore', {})
	]);
	return true;
}

/** Removes a deleted group for good, for everyone, without waiting (#118); only its members */
export async function deleteGroupNow(db: Db, personId: string, groupId: string) {
	if (!(await memberOfDeleted(db, personId, groupId))) return false;
	await purgeDeletedGroup(db, groupId);
	return true;
}
