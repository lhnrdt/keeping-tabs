import { and, eq } from 'drizzle-orm';
import type { PaymentInput } from '#lib/validation.ts';
import { log } from './activity';
import type { Db } from './db';
import { expenses, expenseSplits } from './db/schema';
import { active, isEntryOf } from './expenses';

// A payment (B-3) is an entry of type "payment": paid_by = sender, one split = recipient.

const paymentColumns = (input: PaymentInput) => ({
	type: 'payment' as const,
	splitMode: 'exact' as const,
	title: '',
	amountCents: input.amountCents,
	paidBy: input.from,
	date: input.date,
	sealedDetails: input.sealedDetails ?? null
});

/** A sealed payment has none: who it went to is sealed too (#110) */
const recipientSplit = (db: Db, expenseId: string, input: PaymentInput) =>
	input.sealedDetails
		? []
		: [
				db.insert(expenseSplits).values({
					expenseId,
					memberId: input.to,
					shareCents: input.amountCents,
					input: input.amountCents
				})
			];

const logged = (expenseId: string, input: PaymentInput) =>
	input.sealedDetails ? { expenseId } : { expenseId, ...input };

export async function createPayment(
	db: Db,
	groupId: string,
	actorId: string | null,
	input: PaymentInput,
	id: string = crypto.randomUUID()
) {
	await db.batch([
		db.insert(expenses).values({ id, groupId, ...paymentColumns(input) }),
		...recipientSplit(db, id, input),
		log(db, groupId, actorId, 'payment.create', logged(id, input))
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
	if (!(await isEntryOf(db, groupId, id, 'payment'))) return false;
	await db.batch([
		db
			.update(expenses)
			.set(paymentColumns(input))
			.where(and(eq(expenses.id, id), eq(expenses.type, 'payment'), active(groupId))),
		db.delete(expenseSplits).where(eq(expenseSplits.expenseId, id)),
		...recipientSplit(db, id, input),
		log(db, groupId, actorId, 'payment.update', logged(id, input))
	]);
	return true;
}
