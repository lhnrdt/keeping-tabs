import { and, asc, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import type { GroupKind } from '#lib/group/kinds.ts';
import type { Tint } from '#lib/tints.ts';
import { log } from './activity';
import type { Db } from './db';
import { groups, members } from './db/schema';
import { newShareToken, SHARE_TOKEN_PATTERN } from './token';

export async function findGroupByToken(db: Db, token: string) {
	if (!SHARE_TOKEN_PATTERN.test(token)) return undefined;
	return db.query.groups.findFirst({
		columns: {
			id: true,
			shareToken: true,
			name: true,
			description: true,
			currency: true,
			kind: true,
			tint: true,
			simplifyDebts: true
		},
		where: and(eq(groups.shareToken, token), isNull(groups.deletedAt))
	});
}

export function listMembers(db: Db, groupId: string) {
	return db.query.members.findMany({
		columns: { id: true, name: true, personId: true },
		where: and(eq(members.groupId, groupId), isNull(members.deletedAt)),
		orderBy: [asc(members.createdAt), asc(members.name)]
	});
}

/** Members who were removed (M-6): their past expenses still show their name. */
export function listFormerMembers(db: Db, groupId: string) {
	return db.query.members.findMany({
		columns: { id: true, name: true },
		where: and(eq(members.groupId, groupId), isNotNull(members.deletedAt))
	});
}

/** The member a person has claimed in a group, if any: who is acting (A-5). */
export async function memberOf(db: Db, groupId: string, personId: string | undefined) {
	if (!personId) return null;
	const member = await db.query.members.findFirst({
		columns: { id: true },
		where: and(
			eq(members.groupId, groupId),
			eq(members.personId, personId),
			isNull(members.deletedAt)
		)
	});
	return member?.id ?? null;
}

/** Creates the group with its members; the first member is the creator, claimed by them. */
export async function createGroup(
	db: Db,
	input: {
		name: string;
		description: string | null;
		currency: string;
		kind: GroupKind;
		tint: Tint | null;
		memberNames: string[];
		creatorPersonId: string;
	}
) {
	const groupId = crypto.randomUUID();
	const shareToken = newShareToken();
	const memberRows = input.memberNames.map((name, i) => ({
		id: crypto.randomUUID(),
		groupId,
		name,
		personId: i === 0 ? input.creatorPersonId : null
	}));
	const creatorId = memberRows[0].id;

	// D1 runs a batch as one transaction
	await db.batch([
		db.insert(groups).values({
			id: groupId,
			shareToken,
			name: input.name,
			description: input.description,
			currency: input.currency,
			kind: input.kind,
			tint: input.tint
		}),
		db.insert(members).values(memberRows),
		log(db, groupId, creatorId, 'group.create', {
			name: input.name,
			currency: input.currency,
			members: input.memberNames
		})
	]);

	return { shareToken };
}

export async function updateGroup(
	db: Db,
	groupId: string,
	actorId: string | null,
	changes: {
		name: string;
		description: string | null;
		kind: GroupKind;
		tint: Tint | null;
		simplifyDebts: boolean;
	}
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

/** Groups where a person has claimed a member: "your groups" on every device (A-17). */
export async function listGroupsOf(db: Db, personId: string) {
	return db
		.select({
			id: groups.id,
			name: groups.name,
			token: groups.shareToken,
			currency: groups.currency,
			kind: groups.kind,
			tint: groups.tint,
			memberId: members.id
		})
		.from(members)
		.innerJoin(groups, eq(members.groupId, groups.id))
		.where(and(eq(members.personId, personId), isNull(members.deletedAt), isNull(groups.deletedAt)))
		.orderBy(desc(groups.createdAt));
}
