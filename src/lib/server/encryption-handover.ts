// Existing groups get encrypted by the first of their people to open them (#110). The rest only have
// the old link, with no key in it, so for a while the server hands the key to anyone with the link,
// as it showed them everything before. After that it's gone from the server.
import { env } from 'cloudflare:workers';
import { isNotNull, lt, and } from 'drizzle-orm';
import { isSealed } from '#lib/crypto/seal.ts';
import type { Db } from './db';
import { groups } from './db/schema';

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
