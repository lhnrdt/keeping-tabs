import { and, eq } from 'drizzle-orm';
import type { PaymentInput } from '#lib/validation.ts';
import { log } from './activity';
import type { Db } from './db';
import { expenses, expenseSplits } from './db/schema';
import { active } from './expenses';

// A payment (B-3) is an entry of type "payment": paid_by = sender, one split = recipient.

const paymentColumns = (input: PaymentInput) => ({
	type: 'payment' as const,
	splitMode: 'exact' as const,
	title: '',
	amountCents: input.amountCents,
	paidBy: input.from,
	date: input.date
});

const recipientSplit = (expenseId: string, input: PaymentInput) => ({
	expenseId,
	memberId: input.to,
	shareCents: input.amountCents,
	input: input.amountCents
});

export async function createPayment(
	db: Db,
	groupId: string,
	actorId: string | null,
	input: PaymentInput
) {
	const id = crypto.randomUUID();
	await db.batch([
		db.insert(expenses).values({ id, groupId, ...paymentColumns(input) }),
		db.insert(expenseSplits).values(recipientSplit(id, input)),
		log(db, groupId, actorId, 'payment.create', { expenseId: id, ...input })
	]);
	return id;
}

export async function updatePayment(
	db: Db,
	groupId: string,
	actorId: string | null,
	id: string,
	input: PaymentInput
) {
	await db.batch([
		db
			.update(expenses)
			.set(paymentColumns(input))
			.where(and(eq(expenses.id, id), eq(expenses.type, 'payment'), active(groupId))),
		db.delete(expenseSplits).where(eq(expenseSplits.expenseId, id)),
		db.insert(expenseSplits).values(recipientSplit(id, input)),
		log(db, groupId, actorId, 'payment.update', { expenseId: id, ...input })
	]);
}
