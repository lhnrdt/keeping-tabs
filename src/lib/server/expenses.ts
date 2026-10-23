import { and, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';

import type { ExpenseInput } from '#lib/validation.ts';
import { log, type Action } from './activity';
import type { Db } from './db';
import { expenses, expenseSplits } from './db/schema';

const expenseColumns = {
	id: expenses.id,
	type: expenses.type,
	title: expenses.title,
	amountCents: expenses.amountCents,
	paidBy: expenses.paidBy,
	date: expenses.date,
	category: expenses.category
};

export const active = (groupId: string) =>
	and(eq(expenses.groupId, groupId), isNull(expenses.deletedAt));

/** Current expenses with their splits, newest first (E-9). */
export async function listExpenses(db: Db, groupId: string) {
	const [rows, splits] = await db.batch([
		db
			.select(expenseColumns)
			.from(expenses)
			.where(active(groupId))
			.orderBy(desc(expenses.date), desc(expenses.createdAt)),
		db
			.select({
				expenseId: expenseSplits.expenseId,
				memberId: expenseSplits.memberId,
				shareCents: expenseSplits.shareCents
			})
			.from(expenseSplits)
			.innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
			.where(active(groupId))
	]);
	const byExpense = Map.groupBy(splits, (split) => split.expenseId);
	return rows.map((row) => ({ ...row, splits: byExpense.get(row.id) ?? [] }));
}

/**
 * A page of the expense list, newest first: only these rows (not the group's whole
 * history), plus each payment's recipient.
 */
export async function listEntryPage(db: Db, groupId: string, offset: number, limit: number) {
	const rows = await db
		.select(expenseColumns)
		.from(expenses)
		.where(active(groupId))
		.orderBy(desc(expenses.date), desc(expenses.createdAt))
		.limit(limit)
		.offset(offset);
	const paymentIds = rows.filter((row) => row.type === 'payment').map((row) => row.id);
	const recipients = paymentIds.length
		? await db
				.select({ expenseId: expenseSplits.expenseId, memberId: expenseSplits.memberId })
				.from(expenseSplits)
				.where(inArray(expenseSplits.expenseId, paymentIds))
		: [];
	const recipientOf = new Map(recipients.map((split) => [split.expenseId, split.memberId]));
	return rows.map((row) => ({ ...row, recipient: recipientOf.get(row.id) }));
}

/** One member's share of each of the given expenses (absent when they have none). */
export async function listSharesOf(db: Db, expenseIds: string[], memberId: string) {
	if (expenseIds.length === 0) return new Map<string, number>();
	const rows = await db
		.select({ expenseId: expenseSplits.expenseId, shareCents: expenseSplits.shareCents })
		.from(expenseSplits)
		.where(and(eq(expenseSplits.memberId, memberId), inArray(expenseSplits.expenseId, expenseIds)));
	return new Map(rows.map((row) => [row.expenseId, row.shareCents]));
}

/** Categories chosen by hand in a group, newest first: what its automatic guess learns from. */
export function listChosenCategories(db: Db, groupId: string) {
	return db
		.select({ title: expenses.title, category: expenses.category })
		.from(expenses)
		.where(and(active(groupId), isNotNull(expenses.category)))
		.orderBy(desc(expenses.date), desc(expenses.createdAt));
}

export async function findExpense(db: Db, groupId: string, id: string) {
	const [rows, splits] = await db.batch([
		db
			.select({ ...expenseColumns, splitMode: expenses.splitMode })
			.from(expenses)
			.where(and(eq(expenses.id, id), active(groupId))),
		db
			.select({
				memberId: expenseSplits.memberId,
				shareCents: expenseSplits.shareCents,
				input: expenseSplits.input
			})
			.from(expenseSplits)
			.where(eq(expenseSplits.expenseId, id))
	]);
	return rows[0] && { ...rows[0], splits };
}

const splitRows = (expenseId: string, input: ExpenseInput) =>
	input.shares.map((share) => ({ expenseId, ...share }));

export async function createExpense(
	db: Db,
	groupId: string,
	actorId: string | null,
	input: ExpenseInput
) {
	const id = crypto.randomUUID();
	await db.batch([
		db.insert(expenses).values({
			id,
			groupId,
			type: 'expense',
			splitMode: input.splitMode,
			title: input.title,
			amountCents: input.amountCents,
			paidBy: input.paidBy,
			date: input.date,
			category: input.category
		}),
		db.insert(expenseSplits).values(splitRows(id, input)),
		log(db, groupId, actorId, 'expense.create', { expenseId: id, ...input })
	]);
	return id;
}

export async function updateExpense(
	db: Db,
	groupId: string,
	actorId: string | null,
	id: string,
	input: ExpenseInput
) {
	await db.batch([
		db
			.update(expenses)
			.set({
				title: input.title,
				amountCents: input.amountCents,
				paidBy: input.paidBy,
				date: input.date,
				category: input.category,
				splitMode: input.splitMode
			})
			.where(and(eq(expenses.id, id), active(groupId))),
		db.delete(expenseSplits).where(eq(expenseSplits.expenseId, id)),
		db.insert(expenseSplits).values(splitRows(id, input)),
		log(db, groupId, actorId, 'expense.update', { expenseId: id, ...input })
	]);
}

/** Soft delete (E-7) of an expense or payment; the splits stay for restoring later (L-3). */
export async function softDeleteEntry(
	db: Db,
	groupId: string,
	actorId: string | null,
	id: string,
	action: Extract<Action, 'expense.delete' | 'payment.delete'>
) {
	await db.batch([
		db
			.update(expenses)
			.set({ deletedAt: new Date() })
			.where(and(eq(expenses.id, id), active(groupId))),
		log(db, groupId, actorId, action, { expenseId: id })
	]);
}
