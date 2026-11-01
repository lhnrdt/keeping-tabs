// Receipt photos on expenses (#52), kept in the database as text (see receipt-image.ts).
import { and, asc, count, eq } from 'drizzle-orm';
import {
	MAX_RECEIPTS_PER_EXPENSE,
	MAX_RECEIPTS_PER_GROUP,
	toBase64
} from '#lib/expense/receipt-image.ts';
import type { ErrorCode } from '#lib/errors.ts';
import { log } from './activity';
import type { Db } from './db';
import { expenseReceipts, expenses } from './db/schema';

/** An expense's photos, without the images themselves */
export function listReceipts(db: Db, expenseId: string) {
	return db
		.select({ id: expenseReceipts.id })
		.from(expenseReceipts)
		.where(eq(expenseReceipts.expenseId, expenseId))
		.orderBy(asc(expenseReceipts.createdAt));
}

/** Adds a photo unless there are enough; the caller made sure the expense is the group's */
export async function addReceipt(
	db: Db,
	groupId: string,
	actorId: string,
	expenseId: string,
	bytes: Uint8Array
): Promise<ErrorCode | null> {
	const [[onExpense], [inGroup]] = await db.batch([
		db
			.select({ total: count() })
			.from(expenseReceipts)
			.where(eq(expenseReceipts.expenseId, expenseId)),
		db
			.select({ total: count() })
			.from(expenseReceipts)
			.innerJoin(expenses, eq(expenseReceipts.expenseId, expenses.id))
			.where(eq(expenses.groupId, groupId))
	]);
	if (onExpense.total >= MAX_RECEIPTS_PER_EXPENSE || inGroup.total >= MAX_RECEIPTS_PER_GROUP) {
		return 'receipt_limit';
	}
	await db.batch([
		db.insert(expenseReceipts).values({ expenseId, memberId: actorId, image: toBase64(bytes) }),
		log(db, groupId, actorId, 'receipt.add', { expenseId })
	]);
	return null;
}

export async function deleteReceipt(
	db: Db,
	groupId: string,
	actorId: string,
	expenseId: string,
	receiptId: string
) {
	const [owned] = await db
		.select({ id: expenseReceipts.id })
		.from(expenseReceipts)
		.innerJoin(expenses, eq(expenseReceipts.expenseId, expenses.id))
		.where(
			and(
				eq(expenseReceipts.id, receiptId),
				eq(expenseReceipts.expenseId, expenseId),
				eq(expenses.groupId, groupId)
			)
		);
	if (!owned) return;
	await db.batch([
		db.delete(expenseReceipts).where(eq(expenseReceipts.id, receiptId)),
		log(db, groupId, actorId, 'receipt.delete', { expenseId })
	]);
}

/** The photo's bytes, only if it's on this expense of this group */
export async function receiptImage(db: Db, groupId: string, expenseId: string, receiptId: string) {
	const [row] = await db
		.select({ image: expenseReceipts.image })
		.from(expenseReceipts)
		.innerJoin(expenses, eq(expenseReceipts.expenseId, expenses.id))
		.where(
			and(
				eq(expenseReceipts.id, receiptId),
				eq(expenseReceipts.expenseId, expenseId),
				eq(expenses.groupId, groupId)
			)
		);
	return row && Uint8Array.from(atob(row.image), (char) => char.charCodeAt(0));
}
