// Deleted groups are gone for good once they can't be restored anymore (G-3, #103), or right
// away when a member asks (#118): the group with its members, expenses, splits and activity
// log. The daily run is in worker/app.ts.
import { and, eq, inArray, isNotNull, lt, type SQL } from 'drizzle-orm';
import { DELETED_GROUP_DAYS } from '#lib/group/retention.ts';
import type { Db } from './db';
import {
	activityLog,
	expensePayers,
	recurringExpenses,
	expenses,
	expenseSplits,
	groups,
	members
} from './db/schema';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Removes the groups matching `which` and everything in them, in one transaction */
async function removeGroups(db: Db, which: SQL | undefined) {
	const chosen = db.select({ id: groups.id }).from(groups).where(which);
	const theirExpenses = db
		.select({ id: expenses.id })
		.from(expenses)
		.where(inArray(expenses.groupId, chosen));
	// A fixed number of queries; rows go before the rows they refer to
	await db.batch([
		db.delete(expenseSplits).where(inArray(expenseSplits.expenseId, theirExpenses)),
		db.delete(expensePayers).where(inArray(expensePayers.expenseId, theirExpenses)),
		db.delete(expenses).where(inArray(expenses.groupId, chosen)),
		db.delete(activityLog).where(inArray(activityLog.groupId, chosen)),
		db.delete(recurringExpenses).where(inArray(recurringExpenses.groupId, chosen)),
		db.delete(members).where(inArray(members.groupId, chosen)),
		db.delete(groups).where(which)
	]);
}

export function purgeDeletedGroups(db: Db, now = new Date()) {
	const cutoff = new Date(now.getTime() - DELETED_GROUP_DAYS * DAY_MS);
	return removeGroups(db, lt(groups.deletedAt, cutoff));
}

/** One deleted group, now instead of after the waiting time; active groups are left alone */
export function purgeDeletedGroup(db: Db, groupId: string) {
	return removeGroups(db, and(eq(groups.id, groupId), isNotNull(groups.deletedAt)));
}
