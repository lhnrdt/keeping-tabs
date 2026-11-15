import { and, asc, eq } from 'drizzle-orm';
import { log } from './activity';
import type { Db } from './db';
import { expenseComments } from './db/schema';

/** An expense's comments (#49), oldest first, like a conversation */
export function listComments(db: Db, expenseId: string) {
	return db
		.select({
			id: expenseComments.id,
			memberId: expenseComments.memberId,
			body: expenseComments.body,
			createdAt: expenseComments.createdAt
		})
		.from(expenseComments)
		.where(eq(expenseComments.expenseId, expenseId))
		.orderBy(asc(expenseComments.createdAt));
}

/**
 * Adds a comment by the acting member, once per id; the caller made sure the expense is the
 * group's
 */
export async function addComment(
	db: Db,
	groupId: string,
	actorId: string,
	expenseId: string,
	body: string,
	id?: string
) {
	// Sent again after a lost connection (#55, #347): it's there already
	if (id) {
		const [known] = await db
			.select({ id: expenseComments.id })
			.from(expenseComments)
			.where(eq(expenseComments.id, id))
			.limit(1);
		if (known) return;
	}
	await db.batch([
		db.insert(expenseComments).values({ id, expenseId, memberId: actorId, body }),
		log(db, groupId, actorId, 'comment.create', { expenseId })
	]);
}

/** Removes a comment, only one of the acting member's own; false when there was none */
export async function deleteComment(
	db: Db,
	groupId: string,
	actorId: string,
	expenseId: string,
	commentId: string
) {
	const removed = await db
		.delete(expenseComments)
		.where(
			and(
				eq(expenseComments.id, commentId),
				eq(expenseComments.expenseId, expenseId),
				eq(expenseComments.memberId, actorId)
			)
		)
		.returning({ id: expenseComments.id });
	if (removed.length === 0) return false;
	await log(db, groupId, actorId, 'comment.delete', { expenseId });
	return true;
}
