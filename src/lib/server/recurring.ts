// Expenses that repeat (#45): set up from the expense form, added on their dates by the daily
// job and whenever their group is opened. Each run first claims the dates it adds (an update
// that only one run can win), so nothing is added twice.
import { and, eq, isNull, lte } from 'drizzle-orm';
import { dueTimes, occurrence, type Frequency } from '#lib/expense/recurrence.ts';
import { payersOf } from '#lib/expense/payers.ts';
import type { ExpenseInput } from '#lib/validation.ts';
import { log } from './activity';
import type { Db } from './db';
import { recurringExpenses } from './db/schema';
import { createExpense } from './expenses';
import { listMembers } from './groups';

/** Repeats an expense that was just added for its first date */
export async function startRecurring(
	db: Db,
	groupId: string,
	memberId: string | null,
	input: ExpenseInput,
	frequency: Frequency
) {
	const id = crypto.randomUUID();
	await db.batch([
		db.insert(recurringExpenses).values({
			id,
			groupId,
			memberId,
			template: input,
			frequency,
			added: 1,
			nextOn: occurrence(input.date, frequency, 1)
		}),
		log(db, groupId, memberId, 'recurring.create', {
			recurringId: id,
			title: input.title,
			frequency
		})
	]);
	return id;
}

/** The group's repeating expenses that haven't been stopped */
export async function listRecurring(db: Db, groupId: string) {
	const rows = await db
		.select({
			id: recurringExpenses.id,
			template: recurringExpenses.template,
			frequency: recurringExpenses.frequency,
			nextOn: recurringExpenses.nextOn
		})
		.from(recurringExpenses)
		.where(and(eq(recurringExpenses.groupId, groupId), isNull(recurringExpenses.stoppedAt)))
		.orderBy(recurringExpenses.nextOn);
	return rows.map(({ id, template, frequency, nextOn }) => {
		const input = template as ExpenseInput;
		return { id, title: input.title, amountCents: input.amountCents, frequency, nextOn };
	});
}

export async function stopRecurring(db: Db, groupId: string, actorId: string, id: string) {
	await db.batch([
		db
			.update(recurringExpenses)
			.set({ stoppedAt: new Date() })
			.where(and(eq(recurringExpenses.id, id), eq(recurringExpenses.groupId, groupId))),
		log(db, groupId, actorId, 'recurring.stop', { recurringId: id })
	]);
}

/** Whether everyone the expense names is still in the group */
const stillThere = (input: ExpenseInput, memberIds: ReadonlySet<string>) =>
	[
		input.paidBy,
		...payersOf(input).map((payer) => payer.memberId),
		...input.shares.map((share) => share.memberId)
	].every((id) => memberIds.has(id));

/**
 * Adds what's due by today: every repeating expense of one group, or of all groups (the
 * daily job). Someone it names has left the group: it stops instead of guessing.
 */
export async function addDueRecurring(db: Db, today: string, groupId?: string) {
	const due = await db
		.select()
		.from(recurringExpenses)
		.where(
			and(
				isNull(recurringExpenses.stoppedAt),
				lte(recurringExpenses.nextOn, today),
				groupId ? eq(recurringExpenses.groupId, groupId) : undefined
			)
		);
	for (const rule of due) {
		const input = rule.template as ExpenseInput;
		const members = new Set((await listMembers(db, rule.groupId)).map((member) => member.id));
		if (!stillThere(input, members)) {
			await db
				.update(recurringExpenses)
				.set({ stoppedAt: new Date() })
				.where(eq(recurringExpenses.id, rule.id));
			continue;
		}
		const times = dueTimes(input.date, rule.frequency, rule.added, today);
		if (times.length === 0) continue;
		const added = rule.added + times.length;
		// Claim these dates: only the run that still sees the old count wins
		const claimed = await db
			.update(recurringExpenses)
			.set({ added, nextOn: occurrence(input.date, rule.frequency, added) })
			.where(and(eq(recurringExpenses.id, rule.id), eq(recurringExpenses.added, rule.added)))
			.returning({ id: recurringExpenses.id });
		if (claimed.length === 0) continue;
		for (const n of times) {
			await createExpense(db, rule.groupId, rule.memberId, {
				...input,
				date: occurrence(input.date, rule.frequency, n)
			});
		}
	}
}
