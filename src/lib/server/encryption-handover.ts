// Existing groups get encrypted by the first of their people to open them (#110). The rest only have
// the old link, with no key in it, so for a while the server hands the key to anyone with the link,
// as it showed them everything before. After that it's gone from the server.
import { env } from 'cloudflare:workers';
import { isNotNull, lt, and } from 'drizzle-orm';
import { isSealed } from '#lib/crypto/seal.ts';
import type { Db } from './db';
import { groups, rekeyRows } from './db/schema';
import { listMembers } from './groups';

const HANDOVER_DAYS = 90;
export const handoverEnds = (now = Date.now()) => new Date(now + HANDOVER_DAYS * 86_400_000);

/** Tests keep most groups plain, so they can look at them; "[auto]" in the name opts in */
const keepsPlainInTests = (name: string) =>
	Boolean((env as { TEST_PLAIN_GROUPS?: string }).TEST_PLAIN_GROUPS) &&
	!name.startsWith('[auto]') &&
	!isSealed(name);

export const allowsPlainNewGroup = () =>
	Boolean((env as { TEST_PLAIN_GROUPS?: string }).TEST_PLAIN_GROUPS);

/** Whether this person's browser should encrypt the group now */
export const shouldEncrypt = (group: { keyId: string | null; name: string }, isMember: boolean) =>
	isMember && !group.keyId && !keepsPlainInTests(group.name);

export const endHandovers = (db: Db, now: Date) =>
	db
		.update(groups)
		.set({ transitionKey: null, transitionUntil: null })
		.where(and(isNotNull(groups.transitionUntil), lt(groups.transitionUntil, now)));

/** Someone has the key now. Once everyone who's joined does, the server has no more use for it */
export async function keyReceived(db: Db, groupId: string, memberId: string) {
	const d1 = db.$client;
	await d1.batch([
		d1.prepare('update members set key_received = 1 where id = ?1').bind(memberId),
		d1
			.prepare(
				`update groups set transition_key = null, transition_until = null
				where id = ?1 and key_id is not null and not exists (
					select 1 from members where group_id = ?1 and person_id is not null
					and deleted_at is null and key_received = 0
				)`
			)
			.bind(groupId)
	]);
}

/** Who a sealed row says paid: the group's first member, whoever really did, which is sealed */
export async function placeholderMember(db: Db, groupId: string) {
	const [first] = await listMembers(db, groupId);
	return first?.id ?? null;
}

/** Key changes never finished: long forgotten after a week */
export const dropStaleRekeys = (db: Db, now: Date) =>
	db.delete(rekeyRows).where(lt(rekeyRows.createdAt, new Date(now.getTime() - 7 * 86_400_000)));
