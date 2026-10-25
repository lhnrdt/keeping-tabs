// How people and members connect (A-4, A-5, A-15, M-6). You join a group once: by taking
// the spot someone added for you, or as a new member. After that the member is you; you can
// only step back while you haven't taken part yet. Others can let you join again when you
// lost access, and remove members whose balance is zero.
import { and, eq, isNull, notInArray } from 'drizzle-orm';
import { balances } from '#lib/money.ts';
import { normalizeText, parseMemberName, type Result } from '#lib/validation.ts';
import { log, type Action } from './activity';
import type { Db } from './db';
import { activityLog, members } from './db/schema';
import { listLedger } from './expenses';
import { isUniqueViolation, listMembers } from './groups';

const current = (groupId: string, memberId: string) =>
	and(eq(members.id, memberId), eq(members.groupId, groupId), isNull(members.deletedAt));

/** Joining and stepping back don't count as taking part */
const MEMBERSHIP_ACTIONS: Action[] = ['member.join', 'member.release'];

/** Whether the member added or changed anything in the group (then it's theirs for good). */
export async function hasTakenPart(db: Db, groupId: string, memberId: string) {
	const row = await db
		.select({ id: activityLog.id })
		.from(activityLog)
		.where(
			and(
				eq(activityLog.groupId, groupId),
				eq(activityLog.memberId, memberId),
				notInArray(activityLog.action, MEMBERSHIP_ACTIONS)
			)
		)
		.limit(1);
	return row.length > 0;
}

/** Takes an open spot, if it is still open; false when someone was quicker. */
async function takeSpot(db: Db, groupId: string, personId: string, memberId: string) {
	const [, taken] = await db.batch([
		db
			.update(members)
			.set({ personId })
			.where(and(current(groupId, memberId), isNull(members.personId))),
		db.select({ personId: members.personId }).from(members).where(current(groupId, memberId))
	]);
	if (taken[0]?.personId !== personId) return false;
	await log(db, groupId, memberId, 'member.join', { memberId, spot: true });
	return true;
}

/**
 * Joins a group as `memberId` (an open spot) or under `name`. A name that matches an open
 * spot takes that spot, so nobody ends up twice in a group.
 */
export async function joinGroup(
	db: Db,
	groupId: string,
	personId: string,
	choice: { memberId: string } | { name: unknown }
): Promise<Result<{ memberId: string; name: string }>> {
	const all = await listMembers(db, groupId);
	if (all.some((member) => member.personId === personId)) {
		return { ok: false, error: 'already_member' };
	}

	const lower = 'name' in choice ? normalizeText(choice.name).toLocaleLowerCase() : '';
	const spot =
		'memberId' in choice
			? all.find((member) => member.id === choice.memberId)
			: all.find((member) => !member.personId && member.name.toLocaleLowerCase() === lower);
	if (spot) {
		if (spot.personId || !(await takeSpot(db, groupId, personId, spot.id))) {
			return { ok: false, error: 'member_taken' };
		}
		return { ok: true, value: { memberId: spot.id, name: spot.name } };
	}
	if ('memberId' in choice) return { ok: false, error: 'member_not_found' };

	const name = parseMemberName(
		choice.name,
		all.map((member) => member.name)
	);
	if (!name.ok) return name;
	const id = crypto.randomUUID();
	try {
		await db.batch([
			db.insert(members).values({ id, groupId, name: name.value, personId }),
			log(db, groupId, id, 'member.join', { memberId: id, name: name.value })
		]);
	} catch (error) {
		if (isUniqueViolation(error)) return { ok: false, error: 'already_member' };
		throw error;
	}
	return { ok: true, value: { memberId: id, name: name.value } };
}

/** "Not you?": step back from your member, only while you haven't taken part. */
export async function stepBack(db: Db, groupId: string, memberId: string): Promise<Result<null>> {
	if (await hasTakenPart(db, groupId, memberId))
		return { ok: false, error: 'member_has_taken_part' };
	await db.batch([
		db.update(members).set({ personId: null }).where(current(groupId, memberId)),
		log(db, groupId, memberId, 'member.release', { memberId, reason: 'not_me' })
	]);
	return { ok: true, value: null };
}

/** Someone lost access (e.g. a lost phone): their member is open again so they can rejoin. */
export async function letJoinAgain(db: Db, groupId: string, actorId: string, memberId: string) {
	await db.batch([
		db.update(members).set({ personId: null }).where(current(groupId, memberId)),
		log(db, groupId, actorId, 'member.release', { memberId, reason: 'lost_access' })
	]);
}

/** Removes a member who's settled up (M-6); past expenses keep showing their name. */
export async function removeMember(
	db: Db,
	groupId: string,
	actorId: string,
	memberId: string
): Promise<Result<null>> {
	const [all, ledger] = await Promise.all([listMembers(db, groupId), listLedger(db, groupId)]);
	if (!all.some((member) => member.id === memberId))
		return { ok: false, error: 'member_not_found' };
	const balance = balances([memberId], ledger).get(memberId) ?? 0;
	if (balance !== 0) return { ok: false, error: 'member_not_settled' };
	await db.batch([
		db.update(members).set({ deletedAt: new Date() }).where(current(groupId, memberId)),
		log(db, groupId, actorId, 'member.remove', { memberId })
	]);
	return { ok: true, value: null };
}
