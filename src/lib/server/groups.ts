import { and, asc, eq, isNull } from 'drizzle-orm';
import type { Db } from './db';
import { activityLog, groups, members } from './db/schema';
import { newShareToken, SHARE_TOKEN_PATTERN } from './token';

type Action =
	'group.create' | 'group.update' | 'group.regenerate_link' | 'member.add' | 'member.rename';

const log = (
	db: Db,
	groupId: string,
	memberId: string | null,
	action: Action,
	payload: Record<string, unknown>
) => db.insert(activityLog).values({ groupId, memberId, action, payload });

export async function findGroupByToken(db: Db, token: string) {
	if (!SHARE_TOKEN_PATTERN.test(token)) return undefined;
	return db.query.groups.findFirst({
		columns: { id: true, shareToken: true, name: true, description: true, currency: true },
		where: and(eq(groups.shareToken, token), isNull(groups.deletedAt))
	});
}

export function listMembers(db: Db, groupId: string) {
	return db.query.members.findMany({
		columns: { id: true, name: true },
		where: and(eq(members.groupId, groupId), isNull(members.deletedAt)),
		orderBy: [asc(members.createdAt), asc(members.name)]
	});
}

/** Returns the member id if it belongs to the group, so a forged actor is logged as unknown. */
export async function resolveActor(db: Db, groupId: string, memberId: unknown) {
	if (typeof memberId !== 'string' || !memberId) return null;
	const member = await db.query.members.findFirst({
		columns: { id: true },
		where: and(eq(members.id, memberId), eq(members.groupId, groupId), isNull(members.deletedAt))
	});
	return member?.id ?? null;
}

/** Creates the group with its members; the first member is the creator. */
export async function createGroup(
	db: Db,
	input: { name: string; description: string | null; currency: string; memberNames: string[] }
) {
	const groupId = crypto.randomUUID();
	const shareToken = newShareToken();
	const memberRows = input.memberNames.map((name) => ({ id: crypto.randomUUID(), groupId, name }));
	const creatorId = memberRows[0].id;

	// D1 runs a batch as one transaction
	await db.batch([
		db.insert(groups).values({
			id: groupId,
			shareToken,
			name: input.name,
			description: input.description,
			currency: input.currency
		}),
		db.insert(members).values(memberRows),
		log(db, groupId, creatorId, 'group.create', {
			name: input.name,
			currency: input.currency,
			members: input.memberNames
		})
	]);

	return { shareToken, creatorId };
}

export async function updateGroup(
	db: Db,
	groupId: string,
	actorId: string | null,
	changes: { name: string; description: string | null }
) {
	await db.batch([
		db.update(groups).set(changes).where(eq(groups.id, groupId)),
		log(db, groupId, actorId, 'group.update', changes)
	]);
}

/** Replaces the share token, so the old link stops working (A-7). */
export async function regenerateShareToken(db: Db, groupId: string, actorId: string | null) {
	const shareToken = newShareToken();
	await db.batch([
		db.update(groups).set({ shareToken }).where(eq(groups.id, groupId)),
		log(db, groupId, actorId, 'group.regenerate_link', {})
	]);
	return shareToken;
}

export async function addMember(db: Db, groupId: string, actorId: string | null, name: string) {
	const id = crypto.randomUUID();
	await db.batch([
		db.insert(members).values({ id, groupId, name }),
		log(db, groupId, actorId, 'member.add', { memberId: id, name })
	]);
	return id;
}

export async function renameMember(
	db: Db,
	groupId: string,
	actorId: string | null,
	memberId: string,
	name: string,
	previousName: string
) {
	await db.batch([
		db
			.update(members)
			.set({ name })
			.where(and(eq(members.id, memberId), eq(members.groupId, groupId))),
		log(db, groupId, actorId, 'member.rename', { memberId, name, previousName })
	]);
}

/** D1 reports constraint violations only in the error message. */
export const isUniqueViolation = (error: unknown) =>
	error instanceof Error && /UNIQUE constraint failed/.test(error.message + String(error.cause));
