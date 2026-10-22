import type { Db } from './db';
import { activityLog } from './db/schema';

export type Action =
	| 'group.create'
	| 'group.update'
	| 'group.regenerate_link'
	| 'member.add'
	| 'member.rename'
	| 'member.claim'
	| 'member.release'
	| 'expense.create'
	| 'expense.update'
	| 'expense.delete'
	| 'payment.create'
	| 'payment.update'
	| 'payment.delete';

/** Activity log entry (L-1); a query to run inside the caller's batch. */
export const log = (
	db: Db,
	groupId: string,
	memberId: string | null,
	action: Action,
	payload: Record<string, unknown>
) => db.insert(activityLog).values({ groupId, memberId, action, payload });
