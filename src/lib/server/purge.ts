// Deleted groups are gone for good once they can't be restored anymore (G-3, #103): the
// group with its members, expenses, splits and activity log. Runs daily (worker/app.ts).
import { inArray, lt } from 'drizzle-orm';
import { DELETED_GROUP_DAYS } from '#lib/group/retention.ts';
import type { Db } from './db';
import { activityLog, expenses, expenseSplits, groups, members } from './db/schema';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function purgeDeletedGroups(db: Db, now = new Date()) {
	const cutoff = new Date(now.getTime() - DELETED_GROUP_DAYS * DAY_MS);
	const expired = db.select({ id: groups.id }).from(groups).where(lt(groups.deletedAt, cutoff));
	const theirExpenses = db
		.select({ id: expenses.id })
		.from(expenses)
		.where(inArray(expenses.groupId, expired));
	// One transaction, a fixed number of queries; rows go before the rows they refer to
	await db.batch([
		db.delete(expenseSplits).where(inArray(expenseSplits.expenseId, theirExpenses)),
		db.delete(expenses).where(inArray(expenses.groupId, expired)),
		db.delete(activityLog).where(inArray(activityLog.groupId, expired)),
		db.delete(members).where(inArray(members.groupId, expired)),
		db.delete(groups).where(lt(groups.deletedAt, cutoff))
	]);
}
