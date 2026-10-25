import { and, desc, eq, inArray } from 'drizzle-orm';
import type { Db } from './db';
import { activityLog, expenses, members } from './db/schema';

export type Action =
	| 'group.create'
	| 'group.update'
	| 'group.regenerate_link'
	| 'group.import'
	| 'group.delete'
	| 'group.restore'
	| 'member.add'
	| 'member.rename'
	| 'member.join'
	| 'member.remove'
	| 'member.release'
	| 'expense.create'
	| 'expense.update'
	| 'expense.delete'
	| 'expense.restore'
	| 'payment.create'
	| 'payment.update'
	| 'payment.delete'
	| 'payment.restore';

/** Activity log entry (L-1); a query to run inside the caller's batch. */
export const log = (
	db: Db,
	groupId: string,
	memberId: string | null,
	action: Action,
	payload: Record<string, unknown>
) => db.insert(activityLog).values({ groupId, memberId, action, payload });

/** How many changes the activity screen shows */
export const ACTIVITY_SHOWN = 100;

export type ActivityItem = {
	id: string;
	action: Action;
	at: Date;
	/** Who did it; null when they hadn't picked a member yet */
	who: string | null;
	/** The expense or payment it was about, as it is now */
	entry: {
		id: string;
		type: 'expense' | 'payment';
		title: string;
		amountCents: number;
		deleted: boolean;
	} | null;
	/** A member's name it was about (added, renamed, joined, removed) */
	name: string | null;
	previousName: string | null;
};

/** The group's latest changes, newest first (#43), with names and the entries they touched */
export async function listActivity(db: Db, groupId: string): Promise<ActivityItem[]> {
	const [rows, people] = await db.batch([
		db
			.select({
				id: activityLog.id,
				memberId: activityLog.memberId,
				action: activityLog.action,
				payload: activityLog.payload,
				at: activityLog.createdAt
			})
			.from(activityLog)
			.where(eq(activityLog.groupId, groupId))
			.orderBy(desc(activityLog.createdAt))
			.limit(ACTIVITY_SHOWN),
		db
			.select({ id: members.id, name: members.name })
			.from(members)
			.where(eq(members.groupId, groupId))
	]);
	const names = new Map(people.map((member) => [member.id, member.name]));
	const payloadOf = (payload: unknown) => (payload ?? {}) as Record<string, unknown>;
	const entryIds = [
		...new Set(
			rows
				.map((row) => payloadOf(row.payload).expenseId)
				.filter((id): id is string => typeof id === 'string')
		)
	];
	const entries = entryIds.length
		? await db
				.select({
					id: expenses.id,
					type: expenses.type,
					title: expenses.title,
					amountCents: expenses.amountCents,
					deletedAt: expenses.deletedAt
				})
				.from(expenses)
				.where(and(eq(expenses.groupId, groupId), inArray(expenses.id, entryIds)))
		: [];
	const byId = new Map(entries.map((entry) => [entry.id, entry]));
	return rows.map((row) => {
		const payload = payloadOf(row.payload);
		const entry = typeof payload.expenseId === 'string' ? byId.get(payload.expenseId) : undefined;
		const memberName =
			typeof payload.name === 'string'
				? payload.name
				: typeof payload.memberId === 'string'
					? (names.get(payload.memberId) ?? null)
					: null;
		return {
			id: row.id,
			action: row.action as Action,
			at: row.at,
			who: row.memberId ? (names.get(row.memberId) ?? null) : null,
			entry: entry
				? {
						id: entry.id,
						type: entry.type,
						title: entry.title,
						amountCents: entry.amountCents,
						deleted: entry.deletedAt !== null
					}
				: null,
			name: memberName,
			previousName: typeof payload.previousName === 'string' ? payload.previousName : null
		};
	});
}
